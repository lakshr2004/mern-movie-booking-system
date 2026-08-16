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

    const { redis } = require('../utils/redis');
    const status = {};

    const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    const allSeatIds = [];
    for (const row of rows) {
      for (let num = 1; num <= 10; num++) {
        allSeatIds.push(`${row}${num}`);
      }
    }

    // Try batch fetching Redis locks if redis is available
    let redisLocksMap = {};
    if (redis && redis.status === "ready") {
      try {
        const keys = allSeatIds.map(seatId => `seat:${showId}:${seatId}`);
        const lockUserIds = await redis.mget(keys);
        allSeatIds.forEach((seatId, idx) => {
          if (lockUserIds[idx]) {
            redisLocksMap[seatId] = { lockedBy: lockUserIds[idx] };
          }
        });
      } catch (redisErr) {
        console.log("Redis batch lock status fetch error:", redisErr.message);
      }
    }

    for (const seatId of allSeatIds) {
      const redisLock = redisLocksMap[seatId];
      if (redisLock) {
        status[seatId] = { status: 'LOCKED', ...redisLock };
      } else if (show.bookedSeats && show.bookedSeats.includes(seatId)) {
        status[seatId] = { status: 'BOOKED' };
      } else {
        status[seatId] = { status: 'AVAILABLE' };
      }
    }

    res.json({
      price: show.price,
      seatsStatus: status,
      totalSeats: show.totalSeats || 100,
      bookedSeatsCount: show.bookedSeats ? show.bookedSeats.length : 0
    });
  } catch (error) {
    console.error('Seats status error:', error);
    res.status(500).json({ message: "Seats status failed" });
  }
};



