const Booking = require("../models/Booking");
const Show = require("../models/Show");

const { lockSeats, unlockSeats, getSeatLockStatus } = require("../utils/redis");

/**
 * 📄 Get My Bookings
 */
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("movie")
      .populate({
        path: "show",
        populate: {
          path: "theatre",
          model: "Theatre"
        }
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 🔒 Lock Seats
 */
exports.lockSeatsController = async (req, res) => {
  try {
    const { showId, seats } = req.body;
    const userId = (req.user.id || req.user._id).toString();

    const lockedSeats = await lockSeats(showId, seats, userId);

    if (lockedSeats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Seats already locked by another user",
        lockedSeats: []
      });
    }

    // ✅ STEP 2A FIX: added TTL
    if (global.io) {
      global.io.to(`show-${showId}`).emit("seatLocked", {
        seats: lockedSeats,
        lockedBy: userId,
        ttl: 300 // 5 minutes
      });
    }

    res.json({
      success: true,
      lockedSeats
    });

  } catch (error) {
    console.error("Lock error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * 🔓 Unlock Seats
 */
exports.unlockSeatsController = async (req, res) => {
  try {
    const { showId, seats } = req.body;
    const userId = (req.user.id || req.user._id).toString();

    const unlockedSeats = await unlockSeats(showId, seats, userId);

    if (global.io) {
      global.io.to(`show-${showId}`).emit("seatUnlocked", {
        seats: unlockedSeats
      });
    }

    res.json({
      success: true,
      unlockedSeats
    });

  } catch (error) {
    console.error("Unlock error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * 💳 Final Booking
 */
exports.bookSeats = async (req, res) => {
  try {
    const { showId, seats } = req.body;
    const currentUserId = (req.user.id || req.user._id).toString();

    // 1. Initial check: Verify the show exists
    const show = await Show.findById(showId);
    if (!show) return res.status(404).json({ message: "Show not found" });

    // 2. Lock check: Verify all requested seats are locked by the current user
    const invalidSeats = [];
    for (const seat of seats) {
      // Check Redis lock
      const redisLock = await getSeatLockStatus(showId, seat);

      if (!redisLock || redisLock.lockedBy !== currentUserId) {
        invalidSeats.push(seat);
      }
    }

    if (invalidSeats.length > 0) {
      return res.status(400).json({
        message: "Seats unavailable or not locked by you",
        seats: invalidSeats
      });
    }

    // 3. Atomic Database Update: Reserve the seats in MongoDB
    // This query is thread-safe and guarantees no double booking can occur.
    const updatedShow = await Show.findOneAndUpdate(
      {
        _id: showId,
        bookedSeats: { $nin: seats } // None of the seats must be already booked
      },
      {
        $push: { bookedSeats: { $each: seats } }
      },
      { new: true }
    );

    // If the document is not found, one or more seats were booked concurrently
    if (!updatedShow) {
      return res.status(400).json({
        message: "One or more seats have already been booked by another user",
        seats
      });
    }

    // 4. 🔓 Remove temporary Redis locks now that database write is successful
    await unlockSeats(showId, seats, currentUserId);

    // 5. 💾 Save booking document with self-recovery rollback
    let booking;
    try {
      booking = await Booking.create({
        user: currentUserId,
        movie: show.movie,
        show: showId,
        seats,
        totalPrice: seats.length * show.price,
      });
    } catch (bookingErr) {
      // Rollback: Pull the reserved seats if the booking document creation fails
      await Show.findByIdAndUpdate(showId, {
        $pull: { bookedSeats: { $in: seats } }
      });
      throw bookingErr;
    }

    // 6. Broadcast successful booking via Socket.IO
    if (global.io) {
      global.io.to(`show-${showId}`).emit("seatBooked", {
        seats
      });
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie')
      .populate({
        path: 'show',
        populate: {
          path: 'theatre',
          model: 'Theatre'
        }
      });

    res.json({
      success: true,
      booking: populatedBooking
    });

  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ message: error.message });
  }
};