const express = require("express");
const router = express.Router();

const { getMyBookings, bookSeats } = require("../controllers/BookingControllers");
const { protect } = require("../middleware/authMiddleware");

router.get("/my", protect, getMyBookings);
router.post("/book", protect, bookSeats);

module.exports = router;
