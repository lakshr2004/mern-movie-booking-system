const Show = require("../models/Show");
const Theatre = require("../models/Theatre");

// Get Shows By Movie
exports.getShowsByMovie = async (req, res) => {
  try {
    const shows = await Show.find({ movie: req.params.movieId })
      .populate("movie")
      .populate("theatre");
    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Show
exports.getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate("movie")
      .populate("theatre");
    if (!show) return res.status(404).json({ message: "Show not found" });
    res.json(show);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Shows (Admin)
exports.getAllShows = async (req, res) => {
  try {
    const shows = await Show.find()
      .populate("movie")
      .populate("theatre")
      .sort({ showTime: 1 });
    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Show (Admin)
exports.createShow = async (req, res) => {
  try {
    const { movie, theatre, showTime, price } = req.body;
    if (!movie || !theatre || !showTime || !price) {
      return res.status(400).json({ message: "All fields required" });
    }
    const theatreExists = await Theatre.findById(theatre);
    if (!theatreExists) return res.status(404).json({ message: "Theatre not found" });
    const show = await Show.create({ movie, theatre, showTime, price, bookedSeats: [], lockedSeats: [] });
    const populatedShow = await Show.findById(show._id).populate("movie theatre");
    res.status(201).json(populatedShow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Show (Admin)
exports.updateShow = async (req, res) => {
  try {
    const { movie, theatre, showTime, price } = req.body;
    const show = await Show.findByIdAndUpdate(req.params.id, { movie, theatre, showTime, price }, { new: true, runValidators: true })
      .populate("movie")
      .populate("theatre");
    if (!show) return res.status(404).json({ message: "Show not found" });
    res.json(show);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Show (Admin)
exports.deleteShow = async (req, res) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) return res.status(404).json({ message: "Show not found" });
    res.json({ message: "Show deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lock Seat
exports.lockSeat = async (req, res) => {
  try {
    const { seat, expiresAt } = req.body;
    const show = await Show.findById(req.params.id);
    if (!show) return res.status(404).json({ message: "Show not found" });
    const now = new Date();
    show.lockedSeats = show.lockedSeats.filter(ls => new Date(ls.expiresAt) > now);
    if (show.bookedSeats.includes(seat) || show.lockedSeats.find(ls => ls.seat === seat)) {
      return res.status(400).json({ message: "Seat unavailable" });
    }
    show.lockedSeats.push({ seat, userId: req.user._id, expiresAt });
    await show.save();
    global.io.to(`show-${req.params.id}`).emit('seatLocked', { seat, userId: req.user._id, expiresAt });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unlock Seat
exports.unlockSeat = async (req, res) => {
  try {
    const { seat } = req.body;
    const show = await Show.findById(req.params.id);
    if (!show) return res.status(404).json({ message: "Show not found" });
    show.lockedSeats = show.lockedSeats.filter(ls => ls.seat !== seat);
    await show.save();
    global.io.to(`show-${req.params.id}`).emit('seatUnlocked', { seat });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

