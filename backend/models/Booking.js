const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    required: true
  },

  show: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Show",
    required: true
  },
  seats: {
    type: [String],
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  payment_status: {
    type: String,
    enum: ["pending", "confirmed", "failed"],
    default: "pending"
  },
  razorpay_order_id: {
    type: String
  },
  razorpay_payment_id: {
    type: String
  },
  razorpay_signature: {
    type: String
  },
},
{ timestamps: true }

);

module.exports = mongoose.model("Booking", bookingSchema);