const express = require("express");
const router = express.Router();

const {
  getTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
} = require("../controllers/theatreController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getTheatres);
router.get("/:id", getTheatreById);

// Admin routes (protected)
router.post("/", protect, adminOnly, createTheatre);
router.put("/:id", protect, adminOnly, updateTheatre);
router.delete("/:id", protect, adminOnly, deleteTheatre);

module.exports = router;
