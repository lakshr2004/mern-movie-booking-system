const express = require("express");
const router = express.Router();

const {
  createShow,
  getShowsByMovie,
  getShowById,
  getAllShows,
  updateShow,
  deleteShow,
  getShowSeatsStatus
} = require("../controllers/showController");


const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public routes
router.get("/movie/:movieId", getShowsByMovie);
router.get("/:id", getShowById);
router.get("/:id/seats", protect, getShowSeatsStatus);

// Admin routes (protected)

router.get("/", protect, adminOnly, getAllShows);
router.post("/", protect, adminOnly, createShow);
router.put("/:id", protect, adminOnly, updateShow);
router.delete("/:id", protect, adminOnly, deleteShow);

module.exports = router;
