const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const compression = require("compression");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const Show = require("./models/Show");
const Booking = require("./models/Booking");
const Movie = require("./models/Movie");
const Theatre = require("./models/Theatre");
const bookingRoutes = require("./routes/BookingRoutes");
const contactRoutes = require("./routes/contactRoutes");
const app = express();
const server = http.createServer(app);

// ==========================
// SOCKET.IO SETUP
// ==========================
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(compression()); // Gzip compression for faster response
app.use(express.json());

// ==========================
// AUTO SEED DEFAULT DATA
// ==========================
const seedDefaultData = async () => {
  const movieCount = await Movie.countDocuments();
  const theatreCount = await Theatre.countDocuments();
  
  if (movieCount === 0 || theatreCount === 0) {
    console.log("Seeding default data...");
    
    // 10 Theatres with proper names
    const theatres = [
      { name: "PVR Cinemas - Phoenix Mall", location: "Mumbai, Kurla", totalSeats: 100 },
      { name: "INOX - R City Mall", location: "Mumbai, Ghatkopar", totalSeats: 100 },
      { name: "Cinepolis - Express Avenue", location: "Mumbai, Bhandup", totalSeats: 100 },
      { name: "Miraj Cinemas - Galaxy", location: "Mumbai, Malad", totalSeats: 100 },
      { name: "Carnival Cinemas - Fun", location: "Mumbai, Thane", totalSeats: 100 },
      { name: "PVR ECX - Emporium", location: "Mumbai, Andheri", totalSeats: 100 },
      { name: "Metro INOX - Marine Lines", location: "Mumbai, South", totalSeats: 100 },
      { name: "Cinepolis - Seawoods", location: "Navi Mumbai, Seawoods", totalSeats: 100 },
      { name: "PVR Logix - Noida", location: "Noida, Sector 32", totalSeats: 100 },
      { name: "INOX - Unity Mall", location: "Mumbai, Goregaon", totalSeats: 100 },
    ];
    
    // 15 Movies with real-sounding names
    const movies = [
      { title: "Pushpa 2: The Rule", description: "Action drama about a smuggler's rise to power", duration: 180, genre: "Action", movieLanguage: "Hindi", poster: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400", rating: 8.5 },
      { title: "Dunki", description: "A heartwarming tale of friendship and immigration", duration: 150, genre: "Drama", movieLanguage: "Hindi", poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400", rating: 8.0 },
      { title: "Animal", description: "A complex story of family, love, and revenge", duration: 210, genre: "Action", movieLanguage: "Hindi", poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400", rating: 8.2 },
      { title: "Jawan", description: "A high-octane action thriller about a vigilante", duration: 165, genre: "Action", movieLanguage: "Hindi", poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400", rating: 8.3 },
      { title: "Pathaan", description: "An Indian spy mission to stop a terrorist attack", duration: 145, genre: "Thriller", movieLanguage: "Hindi", poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400", rating: 8.0 },
      { title: "Dhoom 4", description: "Fast-paced action thriller with a iconic villain", duration: 155, genre: "Action", movieLanguage: "Hindi", poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400", rating: 7.8 },
      { title: "Tiger 3", description: "Spy action drama with patriotic themes", duration: 160, genre: "Action", movieLanguage: "Hindi", poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400", rating: 7.5 },
      { title: "War 2", description: "High-stakes espionage action film", duration: 150, genre: "Action", movieLanguage: "Hindi", poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400", rating: 7.9 },
      { title: "Salar 2", description: "Epic action sequel with highoctane sequences", duration: 180, genre: "Action", movieLanguage: "Telugu", poster: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400", rating: 8.4 },
      { title: "Kalki 2898 AD", description: "Sci-fi epic set in futuristic world", duration: 190, genre: "Sci-Fi", movieLanguage: "Telugu", poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400", rating: 8.6 },
      { title: "Bahubali 3", description: "Mythological fantasy epic conclusion", duration: 200, genre: "Fantasy", movieLanguage: "Telugu", poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400", rating: 8.7 },
      { title: "RRR 2", description: "Period drama with spectacular action", duration: 180, genre: "Action", movieLanguage: "Telugu", poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400", rating: 8.5 },
      { title: "Stree 2", description: "Horror comedy about a friendly ghost", duration: 145, genre: "Comedy", movieLanguage: "Hindi", poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400", rating: 7.8 },
      { title: "Bhool Bhulaiyaa 3", description: "Horror comedy with supernatural elements", duration: 155, genre: "Comedy", movieLanguage: "Hindi", poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400", rating: 7.6 },
      { title: "Singham Again", description: "Police action drama with mass appeal", duration: 165, genre: "Action", movieLanguage: "Hindi", poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400", rating: 7.7 },
    ];
    
    // Insert theatres
    const theatreDocs = await Theatre.insertMany(theatres);
    console.log(`✓ Created ${theatreDocs.length} theatres`);
    
    // Insert movies
    const movieDocs = await Movie.insertMany(movies);
    console.log(`✓ Created ${movieDocs.length} movies`);
    
    // 20 time slots
    const timeSlots = [
      "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
      "16:00", "16:30", "17:00", "17:30"
    ];
    
    // Create shows for each movie at each theatre at each time
    const shows = [];
    for (let movie of movieDocs) {
      for (let theatre of theatreDocs) {
        for (let time of timeSlots) {
          const [hour, minute] = time.split(":");
          const showDate = new Date();
          showDate.setHours(parseInt(hour));
          showDate.setMinutes(parseInt(minute));
          showDate.setSeconds(0);
          
          // Price based on time - peak hours more expensive
          let price = 150;
          const hourNum = parseInt(hour);
          if (hourNum >= 12 && hourNum <= 14) price = 250; // Lunch peak
          else if (hourNum >= 18 && hourNum <= 21) price = 300; // Evening peak
          else if (hourNum >= 21) price = 280; // Night
          else price = 150; // Morning
          
          shows.push({
            movie: movie._id,
            theatre: theatre._id,
            showTime: showDate,
            price: price,
            bookedSeats: [],
            lockedSeats: []
          });
        }
      }
    }
    
    await Show.insertMany(shows);
    console.log(`✓ Created ${shows.length} shows`);
    console.log("\n✅ Default data seeded successfully!");
  }
};

// ==========================
// ROUTES
// ==========================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/movies", require("./routes/movieRoutes"));
app.use("/api/shows", require("./routes/showRoutes"));
app.use("/api/bookings", bookingRoutes);
app.use("/api", contactRoutes);
app.use("/api/theatres", require("./routes/theatreRoutes"));

// ==========================
// MONGODB CONNECTION
// ==========================
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");
    await seedDefaultData(); // Auto seed when server starts
  })
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("API Running...");
});

// ==========================
// AUTO EXPIRE LOCKS
// ==========================
setInterval(async () => {
  try {
    const now = new Date();

    const shows = await Show.find({
      "lockedSeats.expiresAt": { $lt: now },
    });

    for (let show of shows) {
      const expiredSeats = show.lockedSeats.filter(
        (seat) => seat.expiresAt < now
      );

      if (expiredSeats.length > 0) {
        await Show.findByIdAndUpdate(show._id, {
          $pull: {
            lockedSeats: {
              expiresAt: { $lt: now },
            },
          },
        });

        expiredSeats.forEach((seat) => {
          io.to(show._id.toString()).emit("seatUnlocked", {
            seat: seat.seat,
          });
        });
      }
    }
  } catch (error) {
    console.log("Expiry Cleanup Error:", error);
  }
}, 30000);

// ==========================
// SOCKET CONNECTION
// ==========================
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinShow", (showId) => {
    socket.join(showId);
  });

  // ==========================
  // UNLOCK SEAT
  // ==========================
  socket.on("unlockSeat", async ({ showId, seat, userId }) => {
    try {
      // Convert userId to ObjectId if needed
      const userIdObj = new mongoose.Types.ObjectId(userId);

      await Show.findByIdAndUpdate(showId, {
        $pull: {
          lockedSeats: { seat: seat, userId: userIdObj },
        },
      });

      io.to(showId).emit("seatUnlocked", { seat });

    } catch (error) {
      console.log("Unlock Seat Error:", error);
    }
  });

  // ==========================
  // LOCK SEAT
  // ==========================
  socket.on("lockSeat", async ({ showId, seat, userId }) => {
    try {
      const now = new Date();

      await Show.findByIdAndUpdate(showId, {
        $pull: {
          lockedSeats: { expiresAt: { $lt: now } },
        },
      });

      const show = await Show.findById(showId);

      if (show.bookedSeats.includes(seat)) {
        socket.emit("seatError", "Seat already booked");
        return;
      }

      const alreadyLocked = show.lockedSeats.find(
        (s) => s.seat === seat && s.userId !== userId
      );

      if (alreadyLocked) {
        socket.emit("seatError", "Seat already locked");
        return;
      }

      const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

      await Show.findByIdAndUpdate(showId, {
        $push: {
          lockedSeats: { seat, userId, expiresAt },
        },
      });

      io.to(showId).emit("seatLocked", { seat, userId });

    } catch (error) {
      console.log("Lock Seat Error:", error);
    }
  });

  // ==========================
  // BOOK SEAT - Simplified (direct booking without locking)
  // ==========================
  socket.on("bookSeat", async (payload) => {
    try {
      const { showId, seats, userId } = payload;

      const show = await Show.findById(showId).populate("movie");
      if (!show) return;

      const seatArray = Array.isArray(seats) ? seats : [];

      if (!Array.isArray(seatArray) || seatArray.length === 0) {
        socket.emit("seatError", "No seats provided");
        return;
      }

      // Check for already booked seats
      const alreadyBooked = seatArray.filter(s => show.bookedSeats.includes(s));
      if (alreadyBooked.length > 0) {
        socket.emit("seatError", `Seats already booked: ${alreadyBooked.join(", ")}`);
        return;
      }

      // Update show seats - add to bookedSeats
      await Show.findByIdAndUpdate(showId, {
        $push: { bookedSeats: { $each: seatArray } },
        $pull: { lockedSeats: { seat: { $in: seatArray } } },
      });

      // Save booking in database
      await Booking.create({
        user: new mongoose.Types.ObjectId(userId),
        movie: show.movie._id,
        show: showId,
        seats: seatArray,
        totalPrice: seatArray.length * show.price,
      });

      io.to(showId).emit("seatsBooked", {
        seats: seatArray,
        userId,
      });

    } catch (error) {
      console.log("Book Seat Error:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ==========================
// START SERVER
// ==========================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});