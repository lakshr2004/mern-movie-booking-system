const mongoose = require("mongoose");
require("dotenv").config();

const Movie = require("./models/Movie");
const Theatre = require("./models/Theatre");
const Show = require("./models/Show");
const Booking = require("./models/Booking");

const SHOW_TIMES = [
  "09:00 AM",
  "12:00 PM",
  "03:00 PM",
  "06:00 PM",
  "09:00 PM",
];

const seatRows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

function generateSeats() {
  const seats = [];

  for (const row of seatRows) {
    for (let i = 1; i <= 10; i++) {
      seats.push(`${row}${i}`);
    }
  }

  return seats;
}

function getShowTime(timeLabel) {
  const [time, meridian] = timeLabel.split(" ");
  const [hourStr, minuteStr] = time.split(":");

  let hour = parseInt(hourStr);

  if (meridian === "PM" && hour !== 12) hour += 12;
  if (meridian === "AM" && hour === 12) hour = 0;

  const date = new Date();
  date.setHours(hour, parseInt(minuteStr), 0, 0);

  return date;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomUnique(arr, count) {
  const copy = [...arr];
  const result = [];

  while (result.length < count && copy.length) {
    const index = Math.floor(Math.random() * copy.length);

    result.push(copy[index]);
    copy.splice(index, 1);
  }

  return result;
}

function createTheatreName(movieTitle, showIndex, theatreIndex) {
  return `${movieTitle} Screen-${showIndex + 1} Theatre-${theatreIndex + 1}`;
}

async function seedDatabase() {
  try {
    console.log("Deleting old show-related data...");

    await Booking.deleteMany({});
    await Show.deleteMany({});
    await Theatre.deleteMany({});

    const movies = await Movie.find({});

    if (!movies.length) {
      console.log("No movies found");
      return;
    }

    const cities = [
      "Mumbai",
      "Delhi",
      "Bangalore",
      "Hyderabad",
      "Chennai",
      "Kolkata",
      "Pune",
      "Jaipur",
      "Lucknow",
      "Ahmedabad",
      "Noida",
      "Surat",
      "Kochi",
      "Chandigarh",
      "Coimbatore",
    ];

    const allSeats = generateSeats();

    let totalTheatres = 0;
    let totalShows = 0;

    for (const movie of movies) {
      for (let showIndex = 0; showIndex < SHOW_TIMES.length; showIndex++) {
        const showTime = getShowTime(SHOW_TIMES[showIndex]);

        for (let theatreIndex = 0; theatreIndex < 10; theatreIndex++) {
          const theatre = await Theatre.create({
            name: createTheatreName(
              movie.title,
              showIndex,
              theatreIndex
            ),
            location:
              cities[
                (showIndex * 10 + theatreIndex) % cities.length
              ],
            totalSeats: 100,
          });

          totalTheatres++;

          const bookedSeats = randomUnique(
            allSeats,
            randomInt(20, 40)
          );

          await Show.create({
            movie: movie._id,
            theatre: theatre._id,
            showTime,
            price: randomInt(150, 350),
            totalSeats: 100,
            bookedSeats,
          });

          totalShows++;
        }
      }
    }

    console.log("==================================");
    console.log("Movies:", movies.length);
    console.log("Theatres:", totalTheatres);
    console.log("Shows:", totalShows);
    console.log("Database Seeded Successfully 🚀");
    console.log("==================================");
  } catch (err) {
    console.error(err);
  }
}

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    await seedDatabase();

    await mongoose.connection.close();

    console.log("MongoDB Connection Closed");
  } catch (err) {
    console.error("Connection Error:", err);
  }
}

start();