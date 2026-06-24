const Show = require("../models/Show");
const Theatre = require("../models/Theatre");

// Get Shows By Movie
exports.getShowsByMovie = async (req, res) => {
  try {
    const shows = await Show.find({ movie: req.params.movieId })
      .populate("movie")
      .populate("theatre");
    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Show
exports.getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate("movie")
      .populate("theatre");
    if (!show) return res.status(404).json({ message: "Show not found" });
    res.json(show);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Shows (Admin)
exports.getAllShows = async (req, res) => {
  try {
    const shows = await Show.find()
      .populate("movie")
      .populate("theatre")
      .sort({ showTime: 1 });
    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Show (Admin)
exports.createShow = async (req, res) => {
  try {
    const { movie, theatre, showTime, price } = req.body;
    if (!movie || !theatre || !showTime || !price) {
      return res.status(400).json({ message: "All fields required" });
    }

    const theatreExists = await Theatre.findById(theatre);
    if (!theatreExists) return res.status(404).json({ message: "Theatre not found" });

    const show = await Show.create({
      movie,
      theatre,
      showTime,
      price,
      bookedSeats: [],
    });

    const populatedShow = await Show.findById(show._id).populate("movie theatre");
    res.status(201).json(populatedShow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Show (Admin)
exports.updateShow = async (req, res) => {
  try {
    const { movie, theatre, showTime, price } = req.body;

    const existingShow = await Show.findById(req.params.id);
    if (!existingShow) return res.status(404).json({ message: "Show not found" });

    // Prevent critical changes (movie, theatre, show time) if the show has active bookings
    if (existingShow.bookedSeats && existingShow.bookedSeats.length > 0) {
      const isMovieChanged = movie && movie.toString() !== existingShow.movie.toString();
      const isTheatreChanged = theatre && theatre.toString() !== existingShow.theatre.toString();
      const isShowTimeChanged = showTime && showTime !== existingShow.showTime;

      if (isMovieChanged || isTheatreChanged || isShowTimeChanged) {
        return res.status(400).json({
          message: "Cannot modify show details (movie, theatre, show time) once tickets have been booked."
        });
      }
    }

    const show = await Show.findByIdAndUpdate(
      req.params.id,
      { movie, theatre, showTime, price },
      { new: true, runValidators: true }
    )
      .populate("movie")
      .populate("theatre");

    res.json(show);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete Show (Admin)
exports.deleteShow = async (req, res) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) return res.status(404).json({ message: "Show not found" });
    res.json({ message: "Show deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Show Seats Status (for seat page)
exports.getShowSeatsStatus = async (req, res) => {
  try {
    const showId = req.params.id;
    const show = await Show.findById(showId);
    if (!show) return res.status(404).json({ message: "Show not found" });

    const { getSeatLockStatus } = require('../utils/redis');
    const status = {};

    // Generate 100 seats A1-J10
    for (let row = 'A'; row <= 'J'; row++) {
      for (let num = 1; num <= 10; num++) {
        const seatId = `${row}${num}`;
        const redisLock = await getSeatLockStatus(showId, seatId);
        
        if (redisLock) {
          status[seatId] = { status: 'LOCKED', ...redisLock };
        } else if (show.bookedSeats.includes(seatId)) {
          status[seatId] = { status: 'BOOKED' };
        } else {
          status[seatId] = { status: 'AVAILABLE' };
        }
      }
    }

    res.json({
      price: show.price,
      seatsStatus: status,
      totalSeats: show.totalSeats || 100,
      bookedSeatsCount: show.bookedSeats.length
    });
  } catch (error) {
    console.error('Seats status error:', error);
    res.status(500).json({ message: "Seats status failed" });
  }
};

// Lock Seats
exports.lockSeats = async (req, res) => {
  try {
    const { seats } = req.body;
    const showId = req.params.id;
    const userId = req.user._id.toString();

    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: "Seats array required" });
    }

    const { lockSeats } = require('../utils/redis');
    const lockedSeats = await lockSeats(showId, seats, userId, 300); // 5min

    global.io.to(`show-${showId}`).emit('seatLocked', { seats: lockedSeats, userId });

    res.json({ success: true, lockedSeats });
  } catch (error) {
    console.error('Lock seats error:', error);
    res.status(500).json({ message: "Lock failed" });
  }
};

// Unlock Seats
exports.unlockSeats = async (req, res) => {
  try {
    const { seats } = req.body;
    const showId = req.params.id;
    const userId = req.user._id.toString();

    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: "Seats array required" });
    }

    const { unlockSeats } = require('../utils/redis');
    const unlockedSeats = await unlockSeats(showId, seats, userId);

    global.io.to(`show-${showId}`).emit('seatUnlocked', { seats: unlockedSeats });

    res.json({ success: true, unlockedSeats });
  } catch (error) {
    console.error('Unlock seats error:', error);
    res.status(500).json({ message: "Unlock failed" });
  }
};


