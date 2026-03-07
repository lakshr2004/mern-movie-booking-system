const Show = require("../models/Show");
const Theatre = require("../models/Theatre");

// 🔹 Get Shows By Movie (Public)
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

// 🔹 Get Single Show (Public)
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

// 🔹 Get All Shows (Admin Only)
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

// 🔹 Create Show (Admin Only)
exports.createShow = async (req, res) => {
  try {
    const { movie, theatre, showTime, price } = req.body;

    if (!movie || !theatre || !showTime || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if theatre exists
    const theatreExists = await Theatre.findById(theatre);
    if (!theatreExists) {
      return res.status(404).json({ message: "Theatre not found" });
    }

    const show = await Show.create({
      movie,
      theatre,
      showTime,
      price,
      bookedSeats: [],
      lockedSeats: [],
    });

    const populatedShow = await Show.findById(show._id)
      .populate("movie")
      .populate("theatre");

    res.status(201).json(populatedShow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Update Show (Admin Only)
exports.updateShow = async (req, res) => {
  try {
    const { movie, theatre, showTime, price } = req.body;

    const show = await Show.findByIdAndUpdate(
      req.params.id,
      { movie, theatre, showTime, price },
      { new: true, runValidators: true }
    )
      .populate("movie")
      .populate("theatre");

    if (!show) return res.status(404).json({ message: "Show not found" });

    res.json(show);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Delete Show (Admin Only)
exports.deleteShow = async (req, res) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);

    if (!show) return res.status(404).json({ message: "Show not found" });

    res.json({ message: "Show deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
