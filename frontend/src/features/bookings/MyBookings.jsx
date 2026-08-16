import { useEffect, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

function MyBookings() {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const bookingToast = location?.state?.bookingToast;
    if (bookingToast?.movieName) {
      toast.success(
        `Booking successful!\n${bookingToast.movieName}\nSeats: ${bookingToast.seatNames}\nTiming: ${bookingToast.timing}`,
        { position: "top-right", autoClose: 4000, hideProgressBar: true, theme: "colored" }
      );
    }

    const fetchBookings = async () => {
      try {
        const res = await API.get("/booking/my");
        if (res?.data && Array.isArray(res.data)) {
          setBookings(res.data);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error("Booking fetch error:", err.response?.data || err.message);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [location]);

  // Safe Poster Src Helper
  const getPosterSrc = (movie) => {
    if (!movie) return "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80";
    if (movie.poster && movie.poster.startsWith("http")) return movie.poster;
    if (movie.fallbackPoster) return movie.fallbackPoster;
    return "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80";
  };

  // Safe & Elegant Showtime Formatter (Fixes "Invalid Date")
  const formatShowTime = (showTimeRaw, createdAtRaw) => {
    let showTimeStr = "";
    if (typeof showTimeRaw === "string") {
      showTimeStr = showTimeRaw;
    } else if (showTimeRaw?.showTime) {
      showTimeStr = showTimeRaw.showTime;
    }

    const bookingDate = createdAtRaw ? new Date(createdAtRaw) : new Date();
    const formattedBookingDate = isNaN(bookingDate.getTime())
      ? "Today"
      : bookingDate.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short", year: "numeric" });

    // Case 1: Plain time string like "09:30 AM", "04:30 PM", "12:00 PM"
    if (showTimeStr && (showTimeStr.includes("AM") || showTimeStr.includes("PM"))) {
      return `${formattedBookingDate} • ${showTimeStr.trim()}`;
    }

    // Case 2: Full ISO Date String
    if (showTimeStr) {
      const parsedDate = new Date(showTimeStr);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleString([], {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }

    // Fallback: Default to booking date + 04:30 PM
    return `${formattedBookingDate} • 04:30 PM`;
  };

  // Stat Calculations
  const confirmedCount = bookings.filter((b) => b.payment_status === "confirmed").length;
  const pendingCount = bookings.filter((b) => b.payment_status === "pending").length;
  const totalSpent = bookings
    .filter((b) => b.payment_status === "confirmed")
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f3e9]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#8b1e3f] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8b1e3f] text-base font-extrabold tracking-wide">
            Retrieving Your Movie Passes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f3e9] px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Page Title & Subtitle */}
        <div className="text-center space-y-2">
          <Motion.h1
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#5b0f1b] font-serif tracking-tight"
          >
            My Bookings & Digital Tickets
          </Motion.h1>
          <p className="text-xs sm:text-sm text-[#4b2e1e] font-semibold max-w-lg mx-auto">
            View your active movie passes, seat assignments, and payment transaction details
          </p>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#faf7f2] border border-[#e7dac8] p-4 rounded-2xl shadow-sm text-center">
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Bookings</div>
            <div className="text-2xl sm:text-3xl font-black text-[#5b0f1b] mt-1">{bookings.length}</div>
          </div>
          <div className="bg-[#faf7f2] border border-[#e7dac8] p-4 rounded-2xl shadow-sm text-center">
            <div className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Confirmed Passes</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-800 mt-1">{confirmedCount}</div>
          </div>
          <div className="bg-[#faf7f2] border border-[#e7dac8] p-4 rounded-2xl shadow-sm text-center">
            <div className="text-xs text-amber-700 font-bold uppercase tracking-wider">Pending Orders</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-800 mt-1">{pendingCount}</div>
          </div>
          <div className="bg-[#faf7f2] border border-[#e7dac8] p-4 rounded-2xl shadow-sm text-center">
            <div className="text-xs text-[#8b1e3f] font-bold uppercase tracking-wider">Total Spent</div>
            <div className="text-2xl sm:text-3xl font-black text-[#8b1e3f] mt-1">₹{totalSpent.toLocaleString()}</div>
          </div>
        </div>

        {/* Empty State */}
        {bookings.length === 0 && (
          <Motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-[#faf7f2] border-2 border-dashed border-[#e7dac8] p-10 sm:p-14 rounded-3xl space-y-4 shadow-sm"
          >
            <div className="text-5xl">🎬</div>
            <h3 className="text-xl font-bold text-[#5b0f1b]">No Movie Bookings Yet</h3>
            <p className="text-xs sm:text-sm text-[#4b2e1e] font-medium max-w-sm mx-auto">
              You haven&apos;t booked any tickets yet. Explore movies in theatres and reserve your seats now!
            </p>
          </Motion.div>
        )}

        {/* Bookings List */}
        <div className="space-y-6">
          {bookings.map((b, idx) => {
            const movie = b.movie || {};
            const theatreName = b.show?.theatre?.name || b.theatreName || "PVR Icon Cinema";
            const locationName = b.show?.theatre?.location || b.location || "City Centre Mall";
            const showTimeFormatted = formatShowTime(b.show?.showTime, b.createdAt);
            const bookingIdShort = b._id ? b._id.slice(-8).toUpperCase() : "TICKET";

            return (
              <Motion.div
                key={b._id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-[#faf7f2] border border-[#e7dac8] hover:border-[#8b1e3f] rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col md:flex-row relative"
              >
                {/* Decorative Side Stub Accent */}
                <div className="hidden md:block w-3 bg-[#8b1e3f] shrink-0" />

                {/* Left Side: Movie Poster Badge Card */}
                <div className="w-full md:w-48 shrink-0 p-4 bg-[#f5efe6] border-b md:border-b-0 md:border-r border-[#e7dac8] flex flex-col justify-between items-center text-center">
                  <div className="relative aspect-[2/3] w-32 sm:w-36 md:w-full rounded-2xl overflow-hidden shadow-md border border-[#e7dac8]">
                    <img
                      src={getPosterSrc(movie)}
                      alt={movie.title || "Movie Poster"}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80";
                      }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#5b0f1b] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase shadow">
                      {movie.certificate || "UA"}
                    </div>
                    <div className="absolute top-2 right-2 bg-amber-500 text-[#2e1c14] text-[10px] font-black px-1.5 py-0.5 rounded shadow">
                      ★ {movie.rating ? movie.rating.toFixed(1) : "8.5"}
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="bg-white text-[#8b1e3f] text-[11px] font-extrabold px-3 py-1 rounded-full border border-[#e7dac8] shadow-xs">
                      {movie.movieLanguage || movie.language || "Hindi"}
                    </span>
                  </div>
                </div>

                {/* Right Side: Rich Ticket Details */}
                <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between space-y-4">
                  {/* Top Row: Title & Status Badge */}
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#e7dac8]/60">
                    <div>
                      <div className="text-[11px] font-extrabold text-[#8b1e3f] uppercase tracking-wider">
                        E-Ticket Pass #{bookingIdShort}
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-[#5b0f1b] font-serif leading-tight mt-0.5">
                        {movie.title || "Movie Booking"}
                      </h2>
                      <p className="text-xs text-[#4b2e1e] font-semibold mt-1">
                        {movie.genre || "Action"} • {movie.duration || 120} mins
                      </p>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {b.payment_status === "confirmed" && (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-black uppercase shadow-xs flex items-center gap-1.5">
                          <span>✓</span> Confirmed
                        </span>
                      )}
                      {b.payment_status === "pending" && (
                        <span className="bg-amber-100 text-amber-800 border border-amber-300 px-3.5 py-1.5 rounded-full text-xs font-black uppercase shadow-xs flex items-center gap-1.5">
                          <span>⏳</span> Pending
                        </span>
                      )}
                      {b.payment_status === "failed" && (
                        <span className="bg-rose-100 text-rose-800 border border-rose-300 px-3.5 py-1.5 rounded-full text-xs font-black uppercase shadow-xs flex items-center gap-1.5">
                          <span>✕</span> Failed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                    {/* Theatre & Location */}
                    <div className="bg-[#f5efe6]/70 border border-[#e7dac8] p-3.5 rounded-2xl space-y-1">
                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <span>🎭</span> Venue & Theatre
                      </div>
                      <div className="font-extrabold text-[#2e1c14] text-sm">
                        {theatreName}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        📍 {locationName}
                      </div>
                    </div>

                    {/* Show Date & Time */}
                    <div className="bg-[#f5efe6]/70 border border-[#e7dac8] p-3.5 rounded-2xl space-y-1">
                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <span>⏰</span> Date & Showtime
                      </div>
                      <div className="font-extrabold text-[#8b1e3f] text-sm">
                        {showTimeFormatted}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        Screen: IMAX 4K Dolby Atmos
                      </div>
                    </div>
                  </div>

                  {/* Seats & Amount Row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#e7dac8]/60">
                    {/* Seat Badges */}
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        Selected Seats ({b.seats?.length || 1} {b.seats?.length === 1 ? "Ticket" : "Tickets"})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {b.seats && b.seats.length > 0 ? (
                          b.seats.map((seat, sIdx) => (
                            <span
                              key={sIdx}
                              className="bg-[#8b1e3f] text-white font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-xs"
                            >
                              {seat}
                            </span>
                          ))
                        ) : (
                          <span className="bg-[#8b1e3f] text-white font-bold text-xs px-2.5 py-1 rounded-lg">
                            Seat Assigned
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                          Total Amount Paid
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-[#5b0f1b]">
                          ₹{b.totalPrice || 250}
                        </div>
                      </div>

                      <Motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setSelectedTicket({ ...b, theatreName, locationName, showTimeFormatted })}
                        className="bg-[#8b1e3f] hover:bg-[#5b0f1b] text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                      >
                        <span>🎟️ View Digital Ticket</span>
                      </Motion.button>
                    </div>
                  </div>

                </div>
              </Motion.div>
            );
          })}
        </div>

      </div>

      {/* DIGITAL TICKET / QR MODAL */}
      <AnimatePresence>
        {selectedTicket && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedTicket(null)}
          >
            <Motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#faf7f2] border-2 border-[#e7dac8] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 relative overflow-hidden"
            >
              <button
                onClick={() => setSelectedTicket(null)}
                className="absolute top-4 right-4 text-[#4b2e1e] hover:text-[#8b1e3f] font-bold text-lg cursor-pointer"
              >
                ✕
              </button>

              <div className="space-y-1">
                <div className="text-xs font-black text-[#8b1e3f] uppercase tracking-widest">
                  TicketPeChalo • Cinema Entry Pass
                </div>
                <h3 className="text-2xl font-black text-[#5b0f1b] font-serif">
                  {selectedTicket.movie?.title || "Movie Ticket"}
                </h3>
              </div>

              {/* Stub Details Box */}
              <div className="bg-white border border-[#e7dac8] rounded-2xl p-4 space-y-3 text-left text-xs">
                <div className="flex justify-between border-b border-[#e7dac8] pb-2">
                  <span className="text-gray-500 font-semibold">Theatre:</span>
                  <span className="font-bold text-[#2e1c14]">{selectedTicket.theatreName}</span>
                </div>

                <div className="flex justify-between border-b border-[#e7dac8] pb-2">
                  <span className="text-gray-500 font-semibold">Location:</span>
                  <span className="font-bold text-[#2e1c14]">{selectedTicket.locationName}</span>
                </div>

                <div className="flex justify-between border-b border-[#e7dac8] pb-2">
                  <span className="text-gray-500 font-semibold">Showtime:</span>
                  <span className="font-extrabold text-[#8b1e3f]">{selectedTicket.showTimeFormatted}</span>
                </div>

                <div className="flex justify-between border-b border-[#e7dac8] pb-2">
                  <span className="text-gray-500 font-semibold">Seats:</span>
                  <span className="font-extrabold text-[#5b0f1b]">{selectedTicket.seats?.join(", ") || "A1"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Booking Ref:</span>
                  <span className="font-mono font-bold text-gray-700">#{selectedTicket._id?.slice(-8).toUpperCase()}</span>
                </div>
              </div>

              {/* Simulated QR Entry Code */}
              <div className="bg-white border border-[#e7dac8] p-4 rounded-2xl space-y-2">
                <div className="font-mono text-2xl font-black text-[#5b0f1b] tracking-widest">
                  ||||| | ||| |||| || |
                </div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  Scan QR / Barcode at Cinema Entrance
                </div>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="w-full bg-[#8b1e3f] hover:bg-[#5b0f1b] text-white font-extrabold py-3 rounded-xl shadow-md text-sm transition cursor-pointer"
              >
                Close Ticket
              </button>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MyBookings;
