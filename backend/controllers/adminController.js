const Movie = require("../models/Movie");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Show = require("../models/Show");

// GET /api/admin/movies?page=&limit=
exports.getAdminMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Movie.countDocuments();
    const movies = await Movie.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      movies,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/bookings?page=&limit=
exports.getAdminBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Booking.countDocuments();
    const bookings = await Booking.find()
      .populate("user", "name email role")
      .populate("movie", "title poster movieLanguage genre")
      .populate({
        path: "show",
        populate: { path: "theatre", select: "name location" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      bookings,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/users?page=&limit=
exports.getAdminUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/stats
exports.getAdminStats = async (req, res) => {
  try {
    const [totalMovies, totalBookingsCount, totalUsers, confirmedBookings] =
      await Promise.all([
        Movie.countDocuments(),
        Booking.countDocuments(),
        User.countDocuments(),
        Booking.find({ payment_status: "confirmed" }),
      ]);

    const totalRevenue = confirmedBookings.reduce(
      (sum, b) => sum + (b.totalPrice || 0),
      0
    );

    res.json({
      totalRevenue,
      totalBookings: totalBookingsCount,
      confirmedBookingsCount: confirmedBookings.length,
      totalUsers,
      totalMovies,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/admin/movies (Manage Movies: Add)
exports.createAdminMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/movies/:id (Manage Movies: Edit)
exports.updateAdminMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/movies/:id (Manage Movies: Delete)
exports.deleteAdminMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json({ message: "Movie deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
