const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");

async function run() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/movieDB");
    console.log("Connected to MongoDB");

    // Clean up test emails
    await User.deleteMany({ email: { $in: ["user@ticket.in", "admin@ticket.in"] } });

    // Create normal user
    const user = new User({
      name: "Normal User",
      email: "user@ticket.in",
      password: "password123", // Will be hashed by pre-save hook
      role: "user"
    });
    await user.save();
    console.log("Normal user created successfully!");

    // Create admin user
    const admin = new User({
      name: "Admin User",
      email: "admin@ticket.in",
      password: "password123", // Will be hashed by pre-save hook
      role: "admin"
    });
    await admin.save();
    console.log("Admin user created successfully!");

    mongoose.disconnect();
  } catch (err) {
    console.error("Error creating users:", err);
    process.exit(1);
  }
}

run();
