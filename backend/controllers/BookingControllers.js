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
