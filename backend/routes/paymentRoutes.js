const express = require("express");
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPaymentSignature,
  cancelPaymentOrder,
  handleWebhook,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

// 💳 Create Razorpay order (protected)
router.post("/create-order", protect, createRazorpayOrder);

// 🔒 Verify payment signature (protected)
router.post("/verify-payment", protect, verifyPaymentSignature);

// ❌ Cancel payment order / release seats (protected)
router.post("/cancel-order", protect, cancelPaymentOrder);

// 🪝 Razorpay Webhook (NOT protected, requires raw body for signature check)
router.post(
  "/webhook",
  handleWebhook
);

module.exports = router;
