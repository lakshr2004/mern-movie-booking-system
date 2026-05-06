const mongoose = require("mongoose");

const showSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    required: true,
  },

  theatre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Theatre",
    required: true,
  },

  // ✅ FIXED
  showTime: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
    default: 200,
  },

  bookedSeats: {
    type: [String],
    default: [],
  },

  totalSeats: {
    type: Number,
    default: 100,
  },
});

showSchema.set("toJSON", { virtuals: false });
showSchema.set("toObject", { virtuals: false });

module.exports = mongoose.model("Show", showSchema);