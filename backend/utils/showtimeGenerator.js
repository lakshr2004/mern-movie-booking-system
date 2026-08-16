/**
 * Utility for generating and validating non-overlapping showtime grids for movies.
 * 
 * Rules:
 * 1. Exactly 5 showtimes per day.
 * 2. Exactly 10 theatres per showtime slot (50 total showtime-theatre slots per movie).
 * 3. No single theatre may have overlapping showtimes.
 *    Required spacing between consecutive showtimes for the same theatre:
 *    gap >= movie duration + 30 minutes (cleaning/buffer).
 */

// Helper to convert "hh:mm AM/PM" string to minutes from midnight
function parseTimeToMinutes(timeStr) {
  const parts = timeStr.trim().split(" ");
  if (parts.length !== 2) return 0;
  const [time, modifier] = parts;
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

// Helper to convert minutes from midnight to formatted "hh:mm AM/PM"
function formatMinutesToTime(totalMinutes) {
  const normalized = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  let hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const modifier = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const paddedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours.toString().padStart(2, "0")}:${paddedMinutes} ${modifier}`;
}

/**
 * Validates that no single theatre has showtimes that overlap.
 * Required gap = duration + 30 minutes buffer.
 * Throws an Error if an overlap is detected.
 */
function validateNoOverlap(showtimesGrid, durationMinutes) {
  const requiredBufferMins = 30;
  const totalOccupiedMins = durationMinutes + requiredBufferMins;

  // Map of theatreName -> array of { timeStr, minutes }
  const theatreMap = new Map();

  for (const slot of showtimesGrid) {
    const slotMinutes = parseTimeToMinutes(slot.time);
    for (const theatre of slot.theatres) {
      const name = theatre.name;
      if (!theatreMap.has(name)) {
        theatreMap.set(name, []);
      }
      theatreMap.get(name).push({
        timeStr: slot.time,
        minutes: slotMinutes,
      });
    }
  }

  // Check each theatre's assigned showtimes for overlaps
  for (const [theatreName, times] of theatreMap.entries()) {
    // Sort times chronologically
    times.sort((a, b) => a.minutes - b.minutes);

    for (let i = 0; i < times.length - 1; i++) {
      const currentShow = times[i];
      const nextShow = times[i + 1];
      const gap = nextShow.minutes - currentShow.minutes;

      if (gap < totalOccupiedMins) {
        throw new Error(
          `Overlap Validation Error for Theatre "${theatreName}": showtime at ${currentShow.timeStr} and ${nextShow.timeStr} are separated by ${gap} mins, but requires at least ${totalOccupiedMins} mins (${durationMinutes}m movie + 30m buffer).`
        );
      }
    }
  }

  return true;
}

/**
 * Reusable seed-data generator function.
 * Input: movie duration, list of available theatres.
 * Output: validated 5x10 showtime-theatre grid with no same-theatre time overlap.
 * 
 * @param {number} durationMinutes 
 * @param {Array} theatrePool 
 * @returns {Array} 5 showtime objects, each with 10 distinct theatres
 */
function generateShowtimeGrid(durationMinutes, theatrePool) {
  if (!theatrePool || theatrePool.length < 10) {
    throw new Error("Theatre pool must contain at least 10 theatres.");
  }

  // 5 standardized daily showtime slots
  // Slot 0: 10:00 AM (600 mins)
  // Slot 1: 01:30 PM (810 mins)
  // Slot 2: 05:00 PM (1020 mins)
  // Slot 3: 08:30 PM (1230 mins)
  // Slot 4: 11:45 PM (1425 mins)
  const baseSlotsMinutes = [600, 810, 1020, 1230, 1425];
  const poolSize = theatrePool.length;

  const showtimesGrid = [];

  // Group theatres into two alternating groups (or offset selection) to guarantee
  // that even for long movies (e.g. 180+ mins), consecutive appearances of a theatre
  // are spaced by at least 2 slot gaps (approx 7 hours / 420 mins).
  for (let sIndex = 0; sIndex < baseSlotsMinutes.length; sIndex++) {
    const slotMins = baseSlotsMinutes[sIndex];
    const timeStr = formatMinutesToTime(slotMins);

    const selectedTheatres = [];
    const offset = (sIndex % 2) * Math.floor(poolSize / 2);

    for (let i = 0; i < 10; i++) {
      const index = (offset + i) % poolSize;
      const t = theatrePool[index];
      selectedTheatres.push({
        name: t.name,
        location: t.location,
        screenType: t.screenType || "IMAX 4K",
        priceRange: t.priceRange || "₹220 - ₹480",
        price: t.price || 250,
      });
    }

    showtimesGrid.push({
      time: timeStr,
      theatres: selectedTheatres,
    });
  }

  // Run mandatory validation check
  validateNoOverlap(showtimesGrid, durationMinutes);

  return showtimesGrid;
}

module.exports = {
  parseTimeToMinutes,
  formatMinutesToTime,
  validateNoOverlap,
  generateShowtimeGrid,
};
