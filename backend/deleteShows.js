const mongoose = require("mongoose");
require("dotenv").config();

const Show = require("./models/Show");

async function deleteShows() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    const result = await Show.deleteMany({});

    console.log("Deleted Shows:", result.deletedCount);

    process.exit(0);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

deleteShows();