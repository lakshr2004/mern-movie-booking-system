const crypto = require("crypto");
const Razorpay = require("razorpay");
const Booking = require("../models/Booking");
const Show = require("../models/Show");
const { getSeatLockStatus, unlockSeats } = require("../utils/redis");

// Helper to initialize Razorpay SDK
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

/**
 * 💳 Create Razorpay Order & Pending Booking
 * POST /api/payment/create-order
 */
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { showId, seats } = req.body;
    const currentUserId = (req.user.id || req.user._id).toString();

    if (!showId || !seats || !seats.length) {
      return res.status(400).json({ message: "Show ID and seats are required" });
    }

    // 1. Verify show exists
    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }

    // 2. Verify all seats are locked by current user in Redis
    const invalidSeats = [];
    for (const seat of seats) {
      const redisLock = await getSeatLockStatus(showId, seat);
      if (!redisLock || redisLock.lockedBy !== currentUserId) {
        invalidSeats.push(seat);
      }
    }

    if (invalidSeats.length > 0) {
      return res.status(400).json({
        message: "Some seats are no longer locked by you. Please select them again.",
        seats: invalidSeats,
      });
    }

    // 3. Atomically update Show in MongoDB to reserve seats (prevents double booking)
    const updatedShow = await Show.findOneAndUpdate(
      {
        _id: showId,
        bookedSeats: { $nin: seats }, // None of the seats must be already booked
      },
      {
        $push: { bookedSeats: { $each: seats } },
      },
      { new: true }
    );

    if (!updatedShow) {
      return res.status(400).json({
        message: "One or more seats have already been booked by another user",
        seats,
      });
    }

    // 4. Create order on Razorpay
    let razorpayOrder;
    try {
      const amount = req.body.amount || (seats.length * show.price * 100); // in paise
      const options = {
        amount,
        currency: "INR",
        receipt: `rcpt_${showId.toString().substring(18)}_${Date.now()}`,
      };

      if (process.env.RAZORPAY_KEY_ID === "rzp_test_bookingKey123") {
        console.log("Mock Mode Active: Generating mock Razorpay order...");
        razorpayOrder = {
          id: `order_mock_${Math.random().toString(36).substring(2, 11)}`,
          amount,
          currency: "INR",
        };
      } else {
        const razorpay = getRazorpayInstance();
        razorpayOrder = await razorpay.orders.create(options);
      }
    } catch (rzpErr) {
      // Rollback: Pull the seats from Show.bookedSeats if Razorpay order creation fails
      await Show.findByIdAndUpdate(showId, {
        $pull: { bookedSeats: { $in: seats } },
      });
      console.error("Razorpay order creation error:", rzpErr);
      return res.status(500).json({ message: "Failed to initiate payment with Razorpay" });
    }

    // 5. Create Pending Booking document in MongoDB
    let booking;
    try {
      const reqAmount = req.body.amount;
      const finalPrice = reqAmount ? (reqAmount / 100) : (seats.length * show.price);
      booking = await Booking.create({
        user: currentUserId,
        movie: show.movie,
        show: showId,
        seats,
        totalPrice: finalPrice,
        payment_status: "pending",
        razorpay_order_id: razorpayOrder.id,
      });
    } catch (bookingErr) {
      // Rollback: Pull the seats from Show.bookedSeats if Booking creation fails
      await Show.findByIdAndUpdate(showId, {
        $pull: { bookedSeats: { $in: seats } },
      });
      console.error("Booking creation error:", bookingErr);
      return res.status(500).json({ message: "Failed to record booking details" });
    }

    // 6. Release Redis locks since they are now locked in MongoDB
    await unlockSeats(showId, seats, currentUserId);

    res.status(201).json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      booking,
      prefill: {
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * 🔒 Verify Razorpay Payment Signature
 * POST /api/payment/verify-payment
 */
exports.verifyPaymentSignature = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing required payment fields" });
    }

    // 1. Verify payment signature
    const isMock = razorpay_order_id && razorpay_order_id.startsWith("order_mock_");
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex");

    const isSignatureValid = isMock ? true : (generatedSignature === razorpay_signature);

    if (!isSignatureValid) {
      console.warn("Invalid payment signature detected!");
      
      // Update booking to failed
      const failedBooking = await Booking.findOneAndUpdate(
        { razorpay_order_id },
        { payment_status: "failed" },
        { new: true }
      );

      if (failedBooking) {
        // Rollback booked seats
        await Show.findByIdAndUpdate(failedBooking.show, {
          $pull: { bookedSeats: { $in: failedBooking.seats } },
        });

        // Broadcast seat unlock via sockets
        if (global.io) {
          global.io.to(`show-${failedBooking.show}`).emit("seatUnlocked", {
            seats: failedBooking.seats,
          });
        }
      }

      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // 2. Confirm booking
    const booking = await Booking.findOneAndUpdate(
      { razorpay_order_id },
      {
        payment_status: "confirmed",
        razorpay_payment_id,
        razorpay_signature,
      },
      { new: true }
    )
      .populate("movie")
      .populate({
        path: "show",
        populate: {
          path: "theatre",
          model: "Theatre",
        },
      });

    if (!booking) {
      return res.status(404).json({ message: "Booking record not found" });
    }

    // 3. Broadcast successful seat booking
    if (global.io) {
      global.io.to(`show-${booking.show._id || booking.show}`).emit("seatBooked", {
        seats: booking.seats,
      });
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
      booking,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ❌ Cancel Payment Order
 * POST /api/payment/cancel-order
 */
exports.cancelPaymentOrder = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;

    if (!razorpay_order_id) {
      return res.status(400).json({ message: "Razorpay order ID is required" });
    }

    // Find and update booking to failed
    const booking = await Booking.findOneAndUpdate(
      { razorpay_order_id, payment_status: "pending" },
      { payment_status: "failed" },
      { new: true }
    );

    if (booking) {
      // Pull seats from Show
      await Show.findByIdAndUpdate(booking.show, {
        $pull: { bookedSeats: { $in: booking.seats } },
      });

      // Broadcast unlock to all clients in the show room
      if (global.io) {
        global.io.to(`show-${booking.show}`).emit("seatUnlocked", {
          seats: booking.seats,
        });
      }

      return res.json({ success: true, message: "Order cancelled and seats released" });
    }

    res.status(400).json({ message: "Booking already processed or not found" });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * 🪝 Handle Razorpay Webhook Event
 * POST /api/payment/webhook
 */
exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      return res.status(400).json({ message: "Signature header missing" });
    }

    // Get the raw body as a string
    const rawBody = req.body.toString("utf-8");

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("⚠️ Webhook verification failed!");
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    console.log(`Received Webhook Event: ${event}`);

    const orderId = payload.payload?.payment?.entity?.order_id;
    const paymentId = payload.payload?.payment?.entity?.id;

    if (!orderId) {
      return res.status(200).json({ received: true });
    }

    if (event === "payment.captured") {
      const booking = await Booking.findOne({ razorpay_order_id: orderId });
      
      if (booking && booking.payment_status === "pending") {
        booking.payment_status = "confirmed";
        booking.razorpay_payment_id = paymentId;
        booking.razorpay_signature = "webhook_verified"; // signature verified via webhook signature instead
        await booking.save();

        // Broadcast seatBooked
        if (global.io) {
          global.io.to(`show-${booking.show}`).emit("seatBooked", {
            seats: booking.seats,
          });
        }
        console.log(`✅ Webhook confirmed booking for order ${orderId}`);
      }
    } else if (event === "payment.failed") {
      const booking = await Booking.findOne({ razorpay_order_id: orderId });

      if (booking && booking.payment_status === "pending") {
        booking.payment_status = "failed";
        await booking.save();

        // Pull seats from show
        await Show.findByIdAndUpdate(booking.show, {
          $pull: { bookedSeats: { $in: booking.seats } },
        });

        // Broadcast seatUnlocked
        if (global.io) {
          global.io.to(`show-${booking.show}`).emit("seatUnlocked", {
            seats: booking.seats,
          });
        }
        console.log(`❌ Webhook marked order ${orderId} as failed and released seats.`);
      }
    }

    // Always respond 200 OK to Razorpay
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Respond 200 to prevent Razorpay from retrying endlessly on internal server hiccups
    res.status(200).json({ received: true, error: error.message });
  }
};
