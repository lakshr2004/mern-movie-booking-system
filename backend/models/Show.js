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
  lockedSeats: {
    type: [{
      seat: String,
      userId: mongoose.Schema.Types.ObjectId,
      expiresAt: Date
    }],
    default: [],
  },
});

module.exports = mongoose.model("Show", showSchema);
