const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const readline = require("readline");
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

// Top brands and high-street/mall locations to generate highly realistic, unique names
const BRANDS = ["PVR", "INOX", "Cinepolis", "Miraj", "Carnival", "MovieMax", "Wave Cinemas", "Rajhans Cinemas", "Mukta A2 Cinemas", "SRS Cinemas"];
const LOCATIONS = [
  "Phoenix Mall", "City Centre", "Grand Square", "Signature", "Galaxy Mall", 
  "Central Mall", "Sapphire Mall", "Metro Plaza", "Downtown Mall", "Elite Plaza",
  "Mall of India", "Forum Mall", "Nexus Mall", "Pacific Mall", "Elante Mall",
  "Express Avenue", "Viviana Mall", "Orion Mall", "Aura Mall", "Crown Plaza"
];

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

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function seedDatabase() {
  try {
    console.log("Checking for existing bookings...");
    const bookingsCount = await Booking.countDocuments({});

    if (bookingsCount > 0) {
      console.log(`⚠️ Warning: There are ${bookingsCount} existing booking(s) in the database.`);
      const force = process.argv.includes("-y") || process.argv.includes("--yes");
      if (!force) {
        const answer = await askQuestion("Are you sure you want to delete all bookings? (y/N): ");
        if (answer.trim().toLowerCase() !== "y" && answer.trim().toLowerCase() !== "yes") {
          console.log("❌ Seeding aborted by user.");
          return;
        }
      }
    }

    console.log("Deleting old show-related data...");
    await Booking.deleteMany({});
    await Show.deleteMany({});
    await Theatre.deleteMany({});

    const movies = await Movie.find({});

    if (!movies.length) {
      console.log("No movies found in the database. Seeding aborted.");
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

    let totalTheatres = 0;
    let totalShows = 0;

    // Generate unique, realistic theatre names.
    // For each movie, we create exactly 10 theatres.
    for (let movieIndex = 0; movieIndex < movies.length; movieIndex++) {
      const movie = movies[movieIndex];
      const movieTheatres = [];

      for (let tIndex = 0; tIndex < 10; tIndex++) {
        // Calculate a unique index in the generated names list
        const nameIdx = movieIndex * 10 + tIndex;
        const brandIndex = Math.floor(nameIdx / LOCATIONS.length) % BRANDS.length;
        const locIndex = nameIdx % LOCATIONS.length;
        const uniqueTheatreName = `${BRANDS[brandIndex]} ${LOCATIONS[locIndex]}`;
        const location = cities[nameIdx % cities.length];

        const theatre = await Theatre.create({
          name: uniqueTheatreName,
          location,
          totalSeats: 100,
        });

        movieTheatres.push(theatre);
        totalTheatres++;
      }

      // Create exactly 5 showtimes for this movie
      for (let sTimeIndex = 0; sTimeIndex < SHOW_TIMES.length; sTimeIndex++) {
        const showTime = getShowTime(SHOW_TIMES[sTimeIndex]);

        // Create a show for each of the 10 theatres
        for (const theatre of movieTheatres) {
          await Show.create({
            movie: movie._id,
            theatre: theatre._id,
            showTime: showTime.toISOString(),
            price: randomInt(150, 350),
            totalSeats: 100,
            bookedSeats: [] // All 100 seats are available initially
          });

          totalShows++;
        }
      }
    }

    // Validation Report
    const movieCount = await Movie.countDocuments({});
    const theatreCount = await Theatre.countDocuments({});
    const showCount = await Show.countDocuments({});

    console.log("\n==================================");
    console.log("DATABASE SEEDING SUCCESSFUL 🚀");
    console.log("==================================");
    console.log("Validation metrics:");
    console.log("- Movie count:", movieCount);
    console.log("- Theatre count:", theatreCount);
    console.log("- Show count:", showCount);

    // Sample theatre names
    const sampleTheatres = await Theatre.find({}).limit(5);
    console.log("\nSample theatre names:");
    sampleTheatres.forEach((t) => {
      console.log(`  * ${t.name} (${t.location})`);
    });

    // Sample showtimes
    const sampleShows = await Show.find({}).populate("movie").populate("theatre").limit(3);
    console.log("\nSample showtimes:");
    sampleShows.forEach((s) => {
      console.log(`  * Show time: ${s.showTime} | Movie: "${s.movie?.title}" | Theatre: "${s.theatre?.name}"`);
    });

    // Sample seat inventory
    if (sampleShows.length > 0) {
      console.log("\nSample seat inventory:");
      const s = sampleShows[0];
      console.log(`  * Show ID: ${s._id}`);
      console.log(`  * Movie: "${s.movie?.title}"`);
      console.log(`  * Theatre: "${s.theatre?.name}"`);
      console.log(`  * Booked seats count: ${s.bookedSeats.length} (expected: 0)`);
      console.log(`  * Booked seats list:`, JSON.stringify(s.bookedSeats));
      console.log(`  * Total seats: ${s.totalSeats} (expected: 100)`);
    }
    console.log("==================================\n");

  } catch (err) {
    console.error("Seeding error:", err);
  }
}

async function start() {
  try {
    console.log("Connecting to Primary MongoDB (Atlas)...");
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ Primary MongoDB Connected Successfully");
    await seedDatabase();
    await mongoose.connection.close();
    console.log("MongoDB Connection Closed");
  } catch (err) {
    console.warn("⚠️ Primary MongoDB Connection Failed:", err.message);
    console.log("🔄 Attempting fallback to Local MongoDB (mongodb://127.0.0.1:27017/movieDB)...");
    try {
      const localUri = "mongodb://127.0.0.1:27017/movieDB";
      await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("✅ Local Fallback MongoDB Connected Successfully");
      await seedDatabase();
      await mongoose.connection.close();
      console.log("MongoDB Connection Closed");
    } catch (localErr) {
      console.error("❌ Critical Error: Both Primary and Local Fallback MongoDB Connections Failed!");
      console.error("Local connection error:", localErr.message);
      process.exit(1);
    }
  }
}

start();