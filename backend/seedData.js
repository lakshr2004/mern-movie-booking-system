const mongoose = require("mongoose");
require("dotenv").config();

const Movie = require("./models/Movie");
const Theatre = require("./models/Theatre");
const Show = require("./models/Show");
const Booking = require("./models/Booking");

// ================= CONNECT DB =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const SHOW_TIMES = ["09:00 AM", "12:00 PM", "03:00 PM", "06:00 PM", "09:00 PM"];

const seatRows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const seatNumbers = Array.from({ length: 10 }, (_, i) => i + 1);

function generateSeats() {
  const seats = [];
  for (const row of seatRows) {
    for (const n of seatNumbers) {
      seats.push(`${row}${n}`);
    }
  }
  return seats;
}

function buildTimeObject(timeLabel) {
  // Convert "09:00 AM" etc to a Date instance for the current day.
  const [timePart, ampm] = timeLabel.split(" ");
  const [hhStr, mmStr] = timePart.split(":");
  let hours = parseInt(hhStr, 10);
  const minutes = parseInt(mmStr, 10);
  if (ampm === "PM" && hours !== 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;

  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function seededRandomInt(min, max) {
  // inclusive min/max
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandomUnique(arr, count) {
  const copy = [...arr];
  const result = [];
  for (let i = 0; i < count && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return result;
}

function theatreNameFactory(movieTitle, showIndex, theatreIndex) {
  // Ensures UNIQUE theatre names across whole DB by embedding movie + showtime + index.
  // Also keeps them human-readable.
  const showLabel = SHOW_TIMES[showIndex].replace(":00 ", " ").replace(/\s+/g, " ");
  const cleanMovie = (movieTitle || "Movie").replace(/\s+/g, " ").trim();
  return `${cleanMovie} ${showLabel} - Theatre ${theatreIndex + 1}`;
}

async function seedDatabase() {
  try {
    // 1) Keep existing Movie data unchanged
    // 2) Remove ONLY showtime/theatre/screen/seat/booking data equivalents:
    // In this project: Theatre + Show + Booking represent the theatre/screen/seat layer.

    console.log("Deleting old show-related data...");

    // delete booking first (if any referential logic exists)
    await Booking.deleteMany();
    await Show.deleteMany();
    await Theatre.deleteMany();

    const movies = await Movie.find({});
    if (!movies.length) {
      console.log("No movies found. Seed aborted.");
      process.exit(0);
    }

    const allSeats = generateSeats(); // A1-A10..J10 = 100

    const showsToInsert = [];
    const theatresToInsert = [];

    const cities = [
      "Mumbai",
      "Delhi",
      "Bangalore",
      "Hyderabad",
      "Chennai",
      "Kochi",
      "Pune",
      "Ahmedabad",
      "Jaipur",
      "Lucknow",
      "Chandigarh",
      "Kolkata",
      "Surat",
      "Noida",
      "Coimbatore",
    ];

    // For each movie, for each showtime: create exactly 10 unique theatres
    for (const movie of movies) {
      for (let showIndex = 0; showIndex < SHOW_TIMES.length; showIndex++) {
        for (let theatreIndex = 0; theatreIndex < 10; theatreIndex++) {
          const theatreName = theatreNameFactory(movie.title, showIndex, theatreIndex);
          const location = cities[(theatreIndex + showIndex) % cities.length];

          theatresToInsert.push({
            name: theatreName,
            location,
            totalSeats: 100,
          });

          // show insert will need theatre id; we will create theatre first in batch per showtime
        }
      }
    }

    // Insert theatres and map them back to (movie, showIndex, theatreIndex)
    // We insert in deterministic order to keep mapping simple.
    const createdTheatres = await Theatre.insertMany(theatresToInsert);

    let theatreCursor = 0;

    for (const movie of movies) {
      for (let showIndex = 0; showIndex < SHOW_TIMES.length; showIndex++) {
        const showTimeDate = buildTimeObject(SHOW_TIMES[showIndex]);

        for (let theatreIndex = 0; theatreIndex < 10; theatreIndex++) {
          const theatreDoc = createdTheatres[theatreCursor++];

          const bookedCount = seededRandomInt(20, 40);
          const bookedSeats = pickRandomUnique(allSeats, bookedCount);

          showsToInsert.push({
            movie: movie._id,
            theatre: theatreDoc._id,
            showTime: showTimeDate.toISOString(),
            price: seededRandomInt(150, 350),
            bookedSeats,
            totalSeats: 100,
          });
        }
      }
    }

    await Show.insertMany(showsToInsert);

    console.log("====================================");
    console.log(`Movies kept: ${movies.length}`);
    console.log(`Showtimes per movie: ${SHOW_TIMES.length} (total shows = movies * 5 * 10 theatres)`);
    console.log(`Theatres created: ${createdTheatres.length}`);
    console.log(`Shows created: ${showsToInsert.length}`);
    console.log("Database Seeded Successfully 🚀");
    console.log("====================================");
  } catch (error) {
    console.log(error);
  } finally {
    process.exit();
  }
}

seedDatabase();

