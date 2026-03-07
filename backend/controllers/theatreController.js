const Theatre = require("../models/Theatre");

// 🔹 Get All Theatres (Public)
exports.getTheatres = async (req, res) => {
  try {
    const theatres = await Theatre.find();
    res.json(theatres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Get Single Theatre
exports.getTheatreById = async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) return res.status(404).json({ message: "Theatre not found" });
    res.json(theatre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Create Theatre (Admin Only)
exports.createTheatre = async (req, res) => {
  try {
    const { name, location, totalSeats } = req.body;

    if (!name || !location) {
      return res.status(400).json({ message: "Name and location are required" });
    }

    const theatre = await Theatre.create({
      name,
      location,
      totalSeats: totalSeats || 100,
    });

    res.status(201).json(theatre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Update Theatre (Admin Only)
exports.updateTheatre = async (req, res) => {
  try {
    const { name, location, totalSeats } = req.body;

    const theatre = await Theatre.findByIdAndUpdate(
      req.params.id,
      { name, location, totalSeats },
      { new: true, runValidators: true }
    );

    if (!theatre) return res.status(404).json({ message: "Theatre not found" });

    res.json(theatre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Delete Theatre (Admin Only)
exports.deleteTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findByIdAndDelete(req.params.id);

    if (!theatre) return res.status(404).json({ message: "Theatre not found" });

    res.json({ message: "Theatre deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

