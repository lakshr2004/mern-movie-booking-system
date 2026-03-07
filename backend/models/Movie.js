const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    duration: {
      type: Number,
      min: 1,
      default: 120,
    },

    genre: {
      type: String,
      trim: true,
      default: "Drama",
    },

    movieLanguage: {
      type: String,
      trim: true,
      default: "Hindi",
    },

    releaseDate: {
      type: Date,
      default: Date.now,
    },

    poster: {
      type: String,
      required: true,
    },

    trailer: {
      type: String,
      default: "",
    },

    cast: [{
      type: String,
      trim: true,
    }],

    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 8,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search optimization
movieSchema.index({ title: "text", genre: "text" });

module.exports = mongoose.model("Movie", movieSchema);