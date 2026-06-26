const mongoose = require("mongoose");
require("dotenv").config();

async function connect() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (err) {
    console.log("Atlas failed, trying local...");
    await mongoose.connect("mongodb://127.0.0.1:27017/movieDB");
  }
}

connect().then(async () => {
  const User = require("./models/User");
  const users = await User.find({}, "name email role");
  console.log("Registered Users:", JSON.stringify(users, null, 2));
  mongoose.disconnect();
}).catch(err => {
  console.error("DB connection error:", err);
});
