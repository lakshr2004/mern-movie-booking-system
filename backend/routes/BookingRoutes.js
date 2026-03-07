const express = require("express");
const router = express.Router();

const { getMyBookings } = require("../controllers/BookingControllers");
const { protect } = require("../middleware/authMiddleware");

router.get("/my", protect, getMyBookings);

module.exports = router;