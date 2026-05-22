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

// DATABASE
mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("MongoDB Connected");

  await seedDefaultData();
});

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
            .emit("seatUnlocked", { seat: seatId });
        }
      }
    }
  } catch (err) {
    console.log("Cleanup cron error:", err.message);
  }
}, 30000);

// SERVER
const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);