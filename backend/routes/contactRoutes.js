const express = require("express");
const router = express.Router();

const { sendContactMessage } = require("../controllers/ContactController");

router.post("/contact", sendContactMessage);

module.exports = router;