const express = require("express");
const router = express.Router();

const {
  createMovie,
  getMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
} = require("../controllers/movieController");

const { protect, adminOnly } = require("../middleware/authMiddleware");


// Public routes
router.get("/", getMovies);
router.get("/:id", getMovieById);


// Admin routes
router.post("/", protect, adminOnly, createMovie);
router.put("/:id", protect, adminOnly, updateMovie);
router.delete("/:id", protect, adminOnly, deleteMovie);


module.exports = router;