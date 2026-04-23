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
    const show = await Show.findById(showId);
    const now = new Date();
    
    show.lockedSeats = show.lockedSeats.filter(ls => new Date(ls.expiresAt) > now);
    
    if (!show) return res.status(404).json({ message: "Show not found" });
    
    const invalidSeats = [];
    for (let seat of seats) {
      if (show.bookedSeats.includes(seat) || show.lockedSeats.find(ls => ls.seat === seat)) {
        invalidSeats.push(seat);
      }
    }
    
    if (invalidSeats.length > 0) {
      console.log(`Booking rejected - invalid seats: ${invalidSeats.join(", ")}`);
      return res.status(400).json({ message: "Seats unavailable", seats: invalidSeats });
    }
    
    const booking = await Booking.create({
      user: req.user.id,
      movie: show.movie,
      show: showId,
      seats,
      totalPrice: seats.length * show.price
    });
    
    show.bookedSeats.push(...seats);
    show.lockedSeats = show.lockedSeats.filter(ls => !seats.includes(ls.seat));
    await show.save();
    
    global.io.to(`show-${showId}`).emit('seatBooked', { seats });
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

