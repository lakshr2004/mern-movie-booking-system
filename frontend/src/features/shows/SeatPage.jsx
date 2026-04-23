import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import socket from "../../services/socket";

// BookMyShow Exact Config
const ROWS = "ABCDEFGHIJKLM".split(""); // A-M for realistic
const COLS = 12;
const SESSION_TIMEOUT = 10 * 60 * 1000; // 10min global
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
  
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;
  const sessionStartRef = useRef(Date.now());
  const selectedSeatsRef = useRef(selectedSeats);

  // Keep ref in sync to avoid stale closures
  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
  }, [selectedSeats]);

  // Global session timer
  useEffect(() => {
    const interval = setInterval(() => {
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
    sessionStartRef.current = Date.now(); // Reset timer
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
      return lock.userId === userId ? "selected" : "locked";
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
  };

  const handleProceed = async () => {
    if (!selectedSeats.length) return;
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
    return <div className="h-screen flex items-center justify-center bg-gradient-to-r from-indigo-50 to-purple-50"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full" /></div>;
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
      <div className="bg-white/80 backdrop-blur-md border-b border-indigo-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-2xl hover:scale-110 transition-transform">←</button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{show?.movie?.title}</h1>
            <p className="text-sm text-gray-600">{show?.theatre?.name} | {show?.showTime} | ₹{show?.price}</p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-800 rounded-xl max-w-2xl">
          {errorMessage}
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left: Seat Map */}
        <div className="lg:w-3/5">
          {/* Screen */}
          <div className="text-center mb-12">
            <div className="w-[85%] mx-auto bg-gradient-to-r from-gray-700 via-gray-500 to-gray-700 h-3 rounded-full shadow-2xl mb-4" />
            <div className="text-sm font-bold text-gray-500 tracking-wider uppercase">SILVER SCREEN</div>
          </div>

          {/* Seats */}
          <div className="space-y-2">
            {ROWS.map((row, rowIndex) => (
              <motion.div 
                key={row} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex items-center gap-1"
              >
                <span className="w-8 text-right font-mono text-sm text-gray-500">{row}</span>
                <div className="flex gap-1.5 flex-1">
                  {Array.from({ length: COLS }).map((_, colIndex) => {
                    const col = colIndex + 1;
                    const seatId = `${row}${col}`;
                    const status = getStatus(seatId);
                    const isAisle = col === 7; // Aisle gap
                    
                    if (isAisle) {
                      return <div key={`aisle-${seatId}`} className="w-3 h-12 bg-gray-200 rounded" />;
                    }

                    const zone = getZone(seatId);
                    const zoneColor = ZONES[zone].color;

                    return (
                      <motion.button
                        key={seatId}
                        onClick={() => selectSeat(seatId)}
                        whileHover={status === "available" ? { scale: 1.05 } : {}}
                        className={`
                          w-12 h-12 rounded-lg font-bold text-xs uppercase shadow-md transition-all duration-200 flex items-center justify-center relative overflow-hidden
                          ${status === "available" 
                            ? `bg-emerald-100 border-2 border-emerald-400 text-emerald-800 hover:bg-emerald-200 hover:shadow-emerald-200/50`
                            : ''}
                          ${status === "selected" 
                            ? `bg-gradient-to-br ${zoneColor} text-white shadow-lg border-2 border-white/50`
                            : ''}
                          ${status === "booked" 
                            ? "bg-red-500/20 border-2 border-red-400 text-red-800"
                            : ''}
                          ${status === "locked" 
                            ? "bg-gradient-to-br from-yellow-400 to-yellow-500 border-2 border-yellow-600 text-white shadow-yellow-300/50"
                            : ''}
                          ${status !== "available" ? "cursor-not-allowed" : "hover:shadow-md cursor-pointer"}
                        `}
                      >
                        <span className="relative z-10">{col}</span>
                        {status === "selected" && (
                          <div className="absolute inset-0 bg-black/10" />
                        )}
                        {status === "booked" && <span className="absolute -top-2 -right-1 text-[10px] bg-red-500 text-white px-1 rounded">BOOKED</span>}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Always visible */}
        <div className="lg:w-2/5 bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-200 h-fit sticky top-24">
          <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">SEAT SELECTION</h3>
          
          {selectedSeats.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl">👤</div>
              <p className="font-semibold">Select your seats</p>
              <p className="text-sm mt-1">Click on available green seats</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Zone breakdown */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3">Selected Seats ({selectedSeats.length})</h4>
                {Object.entries(zoneSummary).map(([zone, count]) => (
                  <div key={zone} className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                    <span className="font-semibold capitalize">{zone} x{count}</span>
                    <span className="font-bold text-emerald-600">₹{(count * show.price).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Seat list */}
              <div className="max-h-32 overflow-y-auto">
                {selectedSeats.sort().map(seat => (
                  <div key={seat} className="flex justify-between items-center py-1 text-sm bg-gradient-to-r from-gray-50 to-indigo-50 rounded-lg px-3 mb-1">
                    <span>{seat}</span>
                    <span className="font-bold text-emerald-600">₹{show?.price}</span>
                  </div>
                ))}
              </div>

              {/* Price */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span>Tickets ({selectedSeats.length})</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>

                <div className="flex justify-between font-bold text-lg text-gray-900 pt-2">
                  <span>Total</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3 pt-4">
                <motion.button
                  onClick={clearAllSeats}
                  className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 px-6 rounded-xl font-semibold uppercase text-sm tracking-wide shadow-lg hover:shadow-xl transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Change Seats
                </motion.button>
                <motion.button
                  onClick={handleProceed}
                  disabled={selectedSeats.length === 0}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-3.5 px-6 rounded-xl font-bold uppercase text-sm tracking-wide shadow-xl hover:shadow-2xl transition-all disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Proceed {totalPrice > 0 && `₹${totalPrice.toLocaleString()}`}
                </motion.button>
              </div>

              {/* Timer warning */}
              <div className={`p-3 rounded-xl text-center text-xs font-semibold ${sessionTimeLeft < 120 ? 'bg-red-100 border-2 border-red-400 text-red-800' : 'bg-indigo-100 border border-indigo-300 text-indigo-800'}`}>
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

