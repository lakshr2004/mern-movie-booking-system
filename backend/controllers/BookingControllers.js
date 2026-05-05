const Booking = require("../models/Booking");
const Show = require("../models/Show");

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

exports.bookSeats = async (req, res) => {
  try {
    const { showId, seats } = req.body;
    const currentUserId = (req.user.id || req.user._id).toString();

    const show = await Show.findById(showId);
    if (!show) return res.status(404).json({ message: "Show not found" });

    const invalidSeats = (seats || []).filter((seat) => show.bookedSeats.includes(seat));
    if (invalidSeats.length > 0) {
      console.log(`Booking rejected - already booked seats: ${invalidSeats.join(", ")}`);
      return res.status(400).json({ message: "Seats unavailable", seats: invalidSeats });
    }

    const booking = await Booking.create({
      user: currentUserId,
      movie: show.movie,
      show: showId,
      seats,
      totalPrice: seats.length * show.price,
    });

    show.bookedSeats.push(...seats);
    await show.save();

    global.io.to(`show-${showId}`).emit("seatBooked", { seats });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

