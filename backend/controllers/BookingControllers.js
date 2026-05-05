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

    const show = await Show.findById(showId);
    if (!show) return res.status(404).json({ message: "Show not found" });

    const invalidSeats = [];

    for (const seat of seats) {
      // Already booked
      if (show.bookedSeats.includes(seat)) {
        invalidSeats.push(seat);
        continue;
      }

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

    // 🔓 Remove lock
    await unlockSeats(showId, seats, currentUserId);

    // 💾 Save booking
    const booking = await Booking.create({
      user: currentUserId,
      movie: show.movie,
      show: showId,
      seats,
      totalPrice: seats.length * show.price,
    });

    show.bookedSeats.push(...seats);
    await show.save();

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