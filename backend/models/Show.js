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
  showTime: {
    type: Date,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  bookedSeats: {
    type: [String],
    default: [],
  },
  totalSeats: {
    type: Number,
    default: 100
  }
});

// Ensure schema transforms (no seat status virtuals/methods)
showSchema.set('toJSON', { virtuals: false });
showSchema.set('toObject', { virtuals: false });

module.exports = mongoose.model("Show", showSchema);

