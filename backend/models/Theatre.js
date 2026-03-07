const mongoose = require("mongoose");

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    totalSeats: {
      type: Number,
      default: 100,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Theatre", theatreSchema);