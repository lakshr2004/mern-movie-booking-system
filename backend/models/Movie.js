const mongoose = require("mongoose");

const castMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const theatreSlotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    screenType: { type: String, default: "IMAX 4K" },
    priceRange: { type: String, default: "₹220 - ₹480" },
    price: { type: Number, default: 250 },
    theatreId: { type: mongoose.Schema.Types.ObjectId, ref: "Theatre" },
    showId: { type: mongoose.Schema.Types.ObjectId, ref: "Show" },
  },
  { _id: false }
);

const showtimeSlotSchema = new mongoose.Schema(
  {
    time: { type: String, required: true, trim: true },
    theatres: [theatreSlotSchema],
  },
  { _id: false }
);

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 150,
    },

    story: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    duration: {
      type: Number,
      required: true,
      min: 1,
      default: 120,
    },

    genre: {
      type: String,
      trim: true,
      default: "Action",
    },

    movieLanguage: {
      type: String,
      trim: true,
      default: "Hindi",
    },

    certificate: {
      type: String,
      trim: true,
      enum: ["U", "UA", "A"],
      default: "UA",
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

    cast: [castMemberSchema],

    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 8.5,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    showtimes: [showtimeSlotSchema],
  },
  {
    timestamps: true,
  }
);

// Index for search optimization
movieSchema.index({ title: "text", genre: "text" });

module.exports = mongoose.model("Movie", movieSchema);