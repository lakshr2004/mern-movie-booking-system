const express = require("express");
const router = express.Router();

const {
  getMyBookings,
  lockSeatsController,
  unlockSeatsController
} = require("../controllers/BookingControllers");

const { protect } = require("../middleware/authMiddleware");

router.get("/my", protect, getMyBookings);

// 🔒 Lock seats
router.post("/lock", protect, lockSeatsController);

// 🔓 Unlock seats
router.post("/unlock", protect, unlockSeatsController);

module.exports = router;