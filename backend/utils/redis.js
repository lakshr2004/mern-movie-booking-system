const Redis = require("ioredis");

/**
 * Redis client for seat locking (Upstash compatible)
 */
let redis;

try {
  redis = new Redis(process.env.REDIS_URL, {
    tls: {
      rejectUnauthorized: false, // important for Upstash
    },
    maxRetriesPerRequest: null, // prevents retry loops
    enableReadyCheck: false,
  });

  redis.on("connect", () => {
    console.log("✅ Redis Connected Successfully");
  });

  redis.on("error", (err) => {
    console.log("❌ Redis Error:", err.message);
  });

  console.log("🚀 Redis client initialized for seat locking");

} catch (err) {
  console.log("❌ Redis connection failed:", err.message);
  redis = null;
}

/**
 * 🔒 Atomic lock multiple seats
 */
const lockSeats = async (showId, seats, userId, ttl = 300) => {
  if (!redis) return [];

  const lockedSeats = [];

  for (const seatId of seats) {
    const key = `seat:${showId}:${seatId}`;

    try {
      const result = await redis.set(key, userId, "EX", ttl, "NX");
      if (result === "OK") lockedSeats.push(seatId);
    } catch (err) {
      console.log("Lock error:", err.message);
    }
  }

  return lockedSeats;
};

/**
 * 🔓 Unlock seats (atomic using Lua)
 */
const unlockSeats = async (showId, seats, userId) => {
  if (!redis) return [];

  const unlockedSeats = [];

  const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;

  for (const seatId of seats) {
    const key = `seat:${showId}:${seatId}`;

    try {
      const result = await redis.eval(script, 1, key, userId);
      if (result === 1) unlockedSeats.push(seatId);
    } catch (err) {
      console.log("Unlock error:", err.message);
    }
  }

  return unlockedSeats;
};

/**
 * 📊 Get seat lock status
 */
const getSeatLockStatus = async (showId, seatId) => {
  if (!redis) return null;

  try {
    const key = `seat:${showId}:${seatId}`;
    const userId = await redis.get(key);

    if (!userId) return null;

    const ttl = await redis.ttl(key);

    return {
      lockedBy: userId,
      ttl,
      expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
    };
  } catch (err) {
    console.log("Status error:", err.message);
    return null;
  }
};

/**
 * 🧹 Cleanup expired locks from Mongo
 */
const cleanupExpiredLockInMongo = async (showId) => {
  try {
    const Show = require("../models/Show");

    const show = await Show.findById(showId);
    if (!show) return;

    const now = new Date();

    show.lockedSeats = show.lockedSeats.filter(
      (ls) => new Date(ls.expiresAt) > now
    );

    await show.save();
  } catch (err) {
    console.log("Cleanup error:", err.message);
  }
};

module.exports = {
  redis,
  lockSeats,
  unlockSeats,
  getSeatLockStatus,
  cleanupExpiredLockInMongo,
};