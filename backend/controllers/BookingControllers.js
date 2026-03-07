const Booking = require("../models/Booking");

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
