const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getAdminMovies,
  getAdminBookings,
  getAdminUsers,
  getAdminStats,
  createAdminMovie,
  updateAdminMovie,
  deleteAdminMovie,
} = require("../controllers/adminController");

// Protect all admin routes with protect + authorize('admin')
router.use(protect);
router.use(authorize("admin"));

// Stats
router.get("/stats", getAdminStats);

// Movies (Paginated + CRUD)
router.get("/movies", getAdminMovies);
router.post("/movies", createAdminMovie);
router.put("/movies/:id", updateAdminMovie);
router.delete("/movies/:id", deleteAdminMovie);

// Bookings (Paginated)
router.get("/bookings", getAdminBookings);

// Users (Paginated)
router.get("/users", getAdminUsers);

module.exports = router;
