const Contact = require("../models/Contact");
const nodemailer = require("nodemailer");

exports.sendContactMessage = async (req, res) => {
  try {

    const { name, email, message } = req.body;

    // Save to DB
    const newMessage = new Contact({
      name,
      email,
      message
    });

    await newMessage.save();

    // Email Transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_PASS
      }
    });

    const mailOptions = {
      from: email,
      to: process.env.ADMIN_EMAIL,
      subject: "TicketPeChalo.in",
      html: `
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b> ${message}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Message sent successfully"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};