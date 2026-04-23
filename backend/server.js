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

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});
global.io = io;

app.use(cors());
app.use(compression());
app.use(express.json());

// Seed data (same as original)
const seedDefaultData = async () => {
  // ... original seed code without lockedSeats ...
};

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/movies", require("./routes/movieRoutes"));
app.use("/api/shows", require("./routes/showRoutes"));
app.use("/api/bookings", bookingRoutes);
app.use("/api", contactRoutes);
app.use("/api/theatres", require("./routes/theatreRoutes"));

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("MongoDB Connected");
  await seedDefaultData();
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-show", (showId) => {
    socket.join(`show-${showId}`);
    console.log(`User ${socket.id} joined show ${showId}`);
  });

  socket.on("lock-seat", async ({ showId, seat }) => {
    try {
      const show = await Show.findById(showId);
      if (!show) return;

// Clean expired locks\n      const now = new Date();\n      show.lockedSeats = show.lockedSeats.filter(ls => new Date(ls.expiresAt) > now);
      
      // Check if seat available
      const isBooked = show.bookedSeats.includes(seat);
      const isLocked = show.lockedSeats.find(ls => ls.seat === seat);
      
      if (isBooked || isLocked) {
        socket.emit("seat-lock-failed", { seat, reason: isBooked ? "booked" : "locked" });
        return;
      }

      // Lock seat for 120s
      show.lockedSeats.push({
        seat,
        userId: socket.id, // temp use socket.id
        expiresAt: new Date(Date.now() + 120000)
      });
      await show.save();

      io.to(`show-${showId}`).emit("seatLocked", { seat, userId: socket.id, expiresAt: show.lockedSeats[show.lockedSeats.length - 1].expiresAt });
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("unlock-seat", async ({ showId, seat }) => {
    try {
      const show = await Show.findById(showId);
      if (!show) return;

      show.lockedSeats = show.lockedSeats.filter(ls => ls.seat !== seat);
      await show.save();

      io.to(`show-${showId}`).emit("seatUnlocked", { seat });
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("disconnect", () => console.log("User disconnected"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server on port ${PORT}`));
