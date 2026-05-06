const mongoose = require("mongoose");
require("dotenv").config();

const Movie = require("./models/Movie");
const Theatre = require("./models/Theatre");
const Show = require("./models/Show");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");

    try {
      console.log("Deleting all movies...");
      await Movie.deleteMany({});

      console.log("Deleting all theatres...");
      await Theatre.deleteMany({});

      console.log("Deleting all shows...");
      await Show.deleteMany({});

      console.log("✅ All data deleted successfully");

      process.exit();
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });