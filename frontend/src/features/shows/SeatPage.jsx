import { useEffect, useState, useCallback, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import socket from "../../services/socket";
import { AuthContext } from "../auth/AuthContext";

// BookMyShow Exact Config
const ROWS = "ABCDEFGHIJKLM".split(""); // A-M for realistic
const COLS = 12;
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5min global
const ZONES = {
  Premium: { rows: ['A', 'B', 'C', 'D'], color: 'from-emerald-400 to-emerald-500' },
  Gold: { rows: ['E', 'F', 'G', 'H'], color: 'from-amber-400 to-amber-500' },
  Silver: { rows: ['I', 'J', 'K', 'L', 'M'], color: 'from-blue-400 to-blue-500' }
};

function SeatPage() {
  const { showId } = useParams();
  const navigate = useNavigate();

  // States
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState({});
  const [bookedSeats, setBookedSeats] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [sessionTimeLeft, setSessionTimeLeft] = useState(SESSION_TIMEOUT / 1000);

  const { user, getUserId } = useContext(AuthContext);
  const userId = getUserId();
  const sessionStartRef = useRef(Date.now());
  const selectedSeatsRef = useRef(selectedSeats);

  // Keep ref in sync to avoid stale closures
  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
  }, [selectedSeats]);

  // Global session timer — only ticks when seats are selected
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedSeatsRef.current.length === 0) return;
      const elapsed = Date.now() - sessionStartRef.current;
      const left = Math.max(0, Math.floor((SESSION_TIMEOUT - elapsed) / 1000));
      setSessionTimeLeft(left);
      if (left <= 0) {
        clearAllSeats();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load show
  useEffect(() => {
    if (!showId) return;
    socket.emit("join-show", showId);

    const loadData = async () => {
      try {
        const { data } = await API.get(`/shows/${showId}`);
        setShow(data);
        setBookedSeats(data.bookedSeats || []);

        const activeLocks = {};
        data.lockedSeats?.forEach(lock => {
          if (new Date(lock.expiresAt) > new Date()) activeLocks[lock.seat] = lock;
        });
        setLockedSeats(activeLocks);

        const myLocked = Object.keys(activeLocks).filter(id => activeLocks[id].userId === userId);
        setSelectedSeats(myLocked);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    return () => socket.emit("leave-show", showId);
  }, [showId, userId]);

  // Socket events
  useEffect(() => {
    const handlers = {
      seatLocked: (data) => {
        setLockedSeats(prev => ({ ...prev, [data.seat]: data }));
        if (data.userId === userId && !selectedSeatsRef.current.includes(data.seat)) {
          setSelectedSeats(prev => [...prev, data.seat]);
        }
      },
      seatUnlocked: ({ seat }) => {
        setLockedSeats(prev => { const next = {...prev}; delete next[seat]; return next; });
        setSelectedSeats(prev => prev.filter(s => s !== seat));
      },
      seatBooked: ({ seats }) => {
        setBookedSeats(prev => [...new Set([...prev, ...seats])]);
        setSelectedSeats(prev => prev.filter(s => !seats.includes(s)));
      },
      'seat-lock-failed': ({ seat }) => {
        setSelectedSeats(prev => prev.filter(s => s !== seat));
        setErrorMessage(`Seat ${seat} taken`);
      }
    };

    Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));
    return () => Object.keys(handlers).forEach(event => socket.off(event, handlers[event]));
  }, [userId]);

  const getStatus = useCallback((seatId) => {
    if (bookedSeats.includes(seatId)) return "booked";
    const lock = lockedSeats[seatId];
    if (lock && new Date(lock.expiresAt) > new Date()) {
      return lock.userId === userId ? "selected" : "booked";
    }
    return "available";
  }, [bookedSeats, lockedSeats, userId]);

  const getZone = (seatId) => {
    const row = seatId[0];
    for (const [zone, config] of Object.entries(ZONES)) {
      if (config.rows.includes(row)) return zone;
    }
    return "Silver";
  };

  const selectSeat = useCallback((seatId) => {
    const status = getStatus(seatId);
    if (status === "selected") {
      // Deselect / unlock
      socket.emit("unlock-seat", { showId, seat: seatId });
      setLockedSeats(prev => { const next = { ...prev }; delete next[seatId]; return next; });
      setSelectedSeats(prev => prev.filter(s => s !== seatId));
      return;
    }
    if (status !== "available") return;

    // Start timer on first seat selection
    if (selectedSeats.length === 0) {
      sessionStartRef.current = Date.now();
    }

    const expiresAt = new Date(Date.now() + SESSION_TIMEOUT).toISOString();
    socket.emit("lock-seat", { showId, seat: seatId, expiresAt });
    // Optimistic
    setLockedSeats(prev => ({ ...prev, [seatId]: { userId, expiresAt } }));
    setSelectedSeats(prev => [...prev, seatId]);
  }, [showId, getStatus, userId]);

  const clearAllSeats = () => {
    selectedSeatsRef.current.forEach(seat => socket.emit("unlock-seat", { showId, seat }));
    setSelectedSeats([]);
    setLockedSeats(prev => {
      const next = { ...prev };
      selectedSeatsRef.current.forEach(s => delete next[s]);
      return next;
    });
    sessionStartRef.current = Date.now();
    setSessionTimeLeft(SESSION_TIMEOUT / 1000);
  };

  const handleProceed = async () => {
    if (!selectedSeats.length) return;
    if (!userId) {
      setErrorMessage("You must be logged in to book seats.");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }
    try {
      await API.post("/bookings/book", { showId, seats: selectedSeats });
      // Backend already broadcasts seatBooked via the HTTP controller
      navigate("/my-bookings");
    } catch (e) {
      const data = e.response?.data;
      setErrorMessage(data?.message || "Booking failed");
    }
  };

  const totalPrice = selectedSeats.length * (show?.price || 0);

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-[#f5f2ee]"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-16 h-16 border-4 border-[#8b1e3f]/20 border-t-[#8b1e3f] rounded-full" /></div>;
  }

  // Zone summary
  const zoneSummary = selectedSeats.reduce((acc, seat) => {
    const zone = getZone(seat);
    acc[zone] = (acc[zone] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-indigo-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3 sm:gap-4">
          <button onClick={() => navigate(-1)} className="text-xl sm:text-2xl hover:scale-110 transition-transform">←</button>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">{show?.movie?.title}</h1>
            <p className="text-xs sm:text-sm text-gray-600">{show?.theatre?.name} | {show?.showTime} | ₹{show?.price}</p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-4 sm:mx-6 mt-4 p-3 sm:p-4 bg-red-100 border border-red-400 text-red-800 rounded-xl max-w-2xl">
          {errorMessage}
        </motion.div>
      )}

      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6 lg:py-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left: Seat Map */}
        <div className="w-full lg:w-3/5">
          {/* Curved Screen */}
          <div className="text-center mb-8 lg:mb-12">
            <div className="relative w-full max-w-xl mx-auto">
              <div className="w-full h-10 sm:h-12 md:h-14 bg-gradient-to-b from-gray-300 to-gray-100 rounded-t-[50%] border-t-4 border-gray-400 shadow-xl" />
            </div>
            <div className="text-xs sm:text-sm font-bold text-gray-500 tracking-wider uppercase mt-2">Silver Screen</div>
          </div>

          {/* Seats */}
          <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
            {ROWS.map((row, rowIndex) => (
              <motion.div 
                key={row} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex items-center gap-1 sm:gap-1.5"
              >
                <span className="w-5 sm:w-6 md:w-8 text-right font-mono text-[10px] sm:text-xs text-gray-500">{row}</span>
                <div className="flex gap-1 sm:gap-1.5 flex-1 justify-center">
                  {Array.from({ length: COLS }).map((_, colIndex) => {
                    const col = colIndex + 1;
                    const seatId = `${row}${col}`;
                    const status = getStatus(seatId);
                    const isAisle = col === 7; // Aisle gap
                    
                    if (isAisle) {
                      return <div key={`aisle-${seatId}`} className="w-2 sm:w-3 md:w-4 lg:w-6 bg-transparent" />;
                    }

                    return (
                      <motion.button
                        key={seatId}
                        onClick={() => selectSeat(seatId)}
                        whileHover={status === "available" ? { scale: 1.05 } : {}}
                        className={`
                          w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 
                          rounded-md sm:rounded-lg font-bold text-[10px] sm:text-xs lg:text-sm uppercase 
                          shadow-sm sm:shadow-md transition-all duration-200 flex items-center justify-center relative overflow-hidden
                          ${status === "available" 
                            ? `bg-white border border-gray-400 text-gray-700 hover:bg-gray-100`
                            : ''}
                          ${status === "selected" 
                            ? `bg-gray-600 text-white shadow-lg border border-gray-700`
                            : ''}
                          ${status === "booked" 
                            ? "bg-gray-400 text-white opacity-80 border border-gray-500"
                            : ''}
                          ${status === "locked" 
                            ? "bg-gray-300 text-gray-500 border border-gray-400"
                            : ''}
                          ${status !== "available" ? "cursor-not-allowed" : "hover:shadow-md cursor-pointer"}
                        `}
                      >
                        <span className="relative z-10">{col}</span>
                        {status === "selected" && (
                          <div className="absolute inset-0 bg-black/10" />
                        )}
                        {status === "booked" && <span className="absolute -top-1 -right-1 text-[8px] sm:text-[10px] bg-gray-600 text-white px-1 rounded">BKD</span>}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white border border-gray-400 rounded" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-600 border border-gray-700 rounded" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-400 opacity-80 border border-gray-500 rounded" />
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-300 border border-gray-400 rounded" />
              <span>Locked</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Bottom on mobile, sticky on desktop */}
        <div className="w-full lg:w-2/5 bg-white/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-2xl border border-gray-200 h-fit lg:sticky lg:top-24">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6 text-center">SEAT SELECTION</h3>
          
          {selectedSeats.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center text-xl sm:text-2xl">👤</div>
              <p className="font-semibold text-sm sm:text-base">Select your seats</p>
              <p className="text-xs sm:text-sm mt-1">Click on available white seats</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Zone breakdown */}
              <div>
                <h4 className="font-bold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">Selected Seats ({selectedSeats.length})</h4>
                {Object.entries(zoneSummary).map(([zone, count]) => (
                  <div key={zone} className="flex justify-between py-1.5 sm:py-2 border-b border-gray-200 last:border-b-0 text-sm">
                    <span className="font-semibold capitalize">{zone} x{count}</span>
                    <span className="font-bold text-gray-600">₹{(count * show.price).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Seat list */}
              <div className="max-h-28 sm:max-h-32 overflow-y-auto">
                {selectedSeats.sort().map(seat => (
                  <div key={seat} className="flex justify-between items-center py-1 text-xs sm:text-sm bg-gray-50 rounded-lg px-3 mb-1">
                    <span>{seat}</span>
                    <span className="font-bold text-gray-600">₹{show?.price}</span>
                  </div>
                ))}
              </div>

              {/* Price */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span>Tickets ({selectedSeats.length})</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>

                <div className="flex justify-between font-bold text-base sm:text-lg text-gray-900 pt-2">
                  <span>Total</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-2 sm:space-y-3 pt-4">
                <motion.button
                  onClick={clearAllSeats}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2.5 sm:py-3 px-6 rounded-xl font-semibold uppercase text-xs sm:text-sm tracking-wide shadow-lg hover:shadow-xl transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Change Seats
                </motion.button>
                <motion.button
                  onClick={handleProceed}
                  disabled={selectedSeats.length === 0}
                  className="w-full bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white py-3 sm:py-3.5 px-6 rounded-xl font-bold uppercase text-xs sm:text-sm tracking-wide shadow-xl hover:shadow-2xl transition-all disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Proceed {totalPrice > 0 && `₹${totalPrice.toLocaleString()}`}
                </motion.button>
              </div>

              {/* Timer warning */}
              <div className={`p-2 sm:p-3 rounded-xl text-center text-xs font-semibold ${sessionTimeLeft < 120 ? 'bg-red-100 border-2 border-red-400 text-red-800' : 'bg-indigo-100 border border-indigo-300 text-indigo-800'}`}>
                ⏱️ {sessionTimeLeft >= 60 ? Math.floor(sessionTimeLeft/60) + 'm' : sessionTimeLeft + 's'} remaining
                {sessionTimeLeft < 120 && ' - Hurry up!'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SeatPage;

