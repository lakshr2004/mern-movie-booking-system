const express = require("express");
const compression = require("compression");
const mongoose = require("mongoose");
const cors = require("cors");
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

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

global.io = io;

const jwt = require("jsonwebtoken");

// Socket authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication error: no token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    return next(new Error("Authentication error: invalid token"));
  }
});

// MIDDLEWARE
app.use(cors());

app.use(compression());

app.use(express.json());

// Seed data
const seedDefaultData = async () => {
  // your original seed code
};

// ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/movies", require("./routes/movieRoutes"));
app.use("/api/shows", require("./routes/showRoutes"));
app.use("/api/booking", bookingRoutes);
app.use("/api", contactRoutes);
app.use("/api/theatres", require("./routes/theatreRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

// SOCKET EVENTS
io.on("connection", (socket) => {
  console.log("User connected:", socket.id, "userId:", socket.userId);

  socket.on("join-show", (showId) => {
    socket.join(`show-${showId}`);

    console.log(`User ${socket.id} joined show ${showId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Seat lock cleanup cron (every 30s)
setInterval(async () => {
  // 1. Temporary Redis locks cleanup
  try {
    const { redis } = require("./utils/redis");

    if (redis) {
      const keys = await redis.keys("seat:*");

      for (const key of keys) {
        const ttl = await redis.ttl(key);

        if (ttl <= 0) {
          const [, showId, seatId] = key.split(":");

          global.io
            .to(`show-${showId}`)
            .emit("seatUnlocked", { seats: [seatId] });
        }
      }
    }
  } catch (err) {
    console.log("Redis cleanup cron error:", err.message);
  }

  // 2. Pending bookings cleanup (older than 5 minutes)
  try {
    const expiredTime = new Date(Date.now() - 5 * 60 * 1000);
    const expiredBookings = await Booking.find({
      payment_status: "pending",
      createdAt: { $lt: expiredTime }
    });

    for (const booking of expiredBookings) {
      console.log(`Auto-expiring pending booking ${booking._id} for show ${booking.show}`);
      booking.payment_status = "failed";
      await booking.save();

      // Pull seats from MongoDB Show.bookedSeats
      await Show.findByIdAndUpdate(booking.show, {
        $pull: { bookedSeats: { $in: booking.seats } }
      });

      // Broadcast seatUnlocked to all clients
      if (global.io) {
        global.io.to(`show-${booking.show}`).emit("seatUnlocked", {
          seats: booking.seats
        });
      }
    }
  } catch (bookingCleanupErr) {
    console.log("Pending booking cleanup error:", bookingCleanupErr.message);
  }
}, 30000);

// DATABASE & SERVER STARTUP
const PORT = process.env.PORT || 5000;

const connectDBAndStartServer = async () => {
  try {
    // Disable command buffering on Mongoose to prevent hanging queries
    mongoose.set("bufferCommands", false);

    console.log("Connecting to Primary MongoDB (Atlas)...");
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout fast after 5s
    });
    console.log("✅ Primary MongoDB Connected Successfully");

    await seedDefaultData();

    // Start listening
    server.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  } catch (primaryErr) {
    console.warn("⚠️ Primary MongoDB Connection Failed:", primaryErr.message);
    console.log("🔄 Attempting fallback to Local MongoDB (mongodb://127.0.0.1:27017/movieDB)...");
    
    try {
      const localUri = "mongodb://127.0.0.1:27017/movieDB";
      await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("✅ Local Fallback MongoDB Connected Successfully");

      await seedDefaultData();

      // Start listening
      server.listen(PORT, () =>
        console.log(`Server running on port ${PORT}`)
      );
    } catch (localErr) {
      console.error("❌ Critical Error: Both Primary and Local Fallback MongoDB Connections Failed!");
      console.error("Local connection error:", localErr.message);
      process.exit(1); // Fail fast
    }
  }
};

connectDBAndStartServer();