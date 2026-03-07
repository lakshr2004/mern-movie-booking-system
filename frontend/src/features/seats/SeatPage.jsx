import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { motion as Motion } from "framer-motion";
import API from "../../services/api";
import { AuthContext } from "../auth/AuthContext";

const socket = io("http://localhost:5000");

function SeatPage() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockTimers, setLockTimers] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [lastBookedSeats, setLastBookedSeats] = useState([]);

  const rows = "ABCDEFGHIJ".split("");

  useEffect(() => {
    const fetchShow = async () => {
      try {
        const res = await API.get("/shows/" + showId);
        setShow(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchShow();

    socket.emit("joinShow", showId);

    socket.on("seatLocked", ({ seat, userId }) => {
      setShow((prev) => ({
        ...prev,
        lockedSeats: [...prev.lockedSeats, { seat, userId, expiresAt: Date.now() + 120000 }],
      }));
      if (userId === user?.user?.id) {
        setLockTimers((prev) => ({ ...prev, [seat]: 120 }));
      }
    });

    socket.on("seatUnlocked", ({ seat }) => {
      setShow((prev) => ({
        ...prev,
        lockedSeats: prev.lockedSeats.filter((s) => s.seat !== seat),
      }));
      setLockTimers((prev) => {
        const updated = { ...prev };
        delete updated[seat];
        return updated;
      });
      setSelectedSeats((prev) => prev.filter((s) => s !== seat));
    });

    socket.on("seatsBooked", ({ seats }) => {
      setShow((prev) => ({
        ...prev,
        bookedSeats: [...prev.bookedSeats, ...seats],
        lockedSeats: prev.lockedSeats.filter((s) => !seats.includes(s.seat)),
      }));
      setLastBookedSeats(seats);
      setShowPopup(true);
      setSelectedSeats([]);
      setLockTimers({});
      setTimeout(() => {
        setShowPopup(false);
        navigate("/my-bookings");
      }, 2000);
    });

    return () => {
      socket.off("seatLocked");
      socket.off("seatUnlocked");
      socket.off("seatsBooked");
    };
  }, [showId, user, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLockTimers((prev) => {
        const updated = {};
        Object.keys(prev).forEach((seat) => {
          if (prev[seat] > 0) updated[seat] = prev[seat] - 1;
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSeatClick = (seatStr) => {
    if (!user) return;
    if (selectedSeats.includes(seatStr)) {
      socket.emit("unlockSeat", { showId, seat: seatStr, userId: user.user.id });
      setSelectedSeats((prev) => prev.filter((s) => s !== seatStr));
      return;
    }
    socket.emit("lockSeat", { showId, seat: seatStr, userId: user.user.id });
    setSelectedSeats((prev) => [...prev, seatStr]);
  };

  const handleBookSeat = () => {
    if (selectedSeats.length === 0) return;
    socket.emit("bookSeat", { showId, seats: selectedSeats, userId: user.user.id });
  };

  // Skeleton loader for seat page
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f3e9] px-4 sm:px-6 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Title skeleton */}
          <div className="h-10 w-64 bg-gray-300 animate-pulse rounded mx-auto mb-10" />

          {/* Screen skeleton */}
          <div className="h-16 sm:h-20 bg-gray-300 animate-pulse rounded-b-[100%] mx-auto mb-12 w-[95%] sm:w-[80%]" />

          {/* Seats skeleton */}
          <div className="space-y-3 sm:space-y-4">
            {rows.map((row) => (
              <div key={row} className="flex justify-center gap-2 sm:gap-4 flex-wrap">
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 animate-pulse rounded-md" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!show) {
    return <div className="min-h-screen bg-[#f8f3e9] flex items-center justify-center">Loading Seats...</div>;
  }

  return (
    <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#f8f3e9] px-4 sm:px-6 py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-[#6b3e26] mb-10">
        Select Your Seat
      </h1>

      <div className="text-center mb-12">
        <div className="relative mx-auto w-[95%] sm:w-[80%] h-16 sm:h-20">
          <div className="absolute inset-0  from-gray-300 via-gray-400 to-gray-500 rounded-b-[100%] shadow-lg" />
        </div>
        <p className="text-xs sm:text-sm text-gray-500 tracking-widest mt-2">SCREEN</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
        {rows.map((row) => (
          <div key={row} className="flex justify-center gap-2 sm:gap-4 flex-wrap">
            {Array.from({ length: 10 }, (_, i) => {
              const seatStr = row + (i + 1);
              const isBooked = show.bookedSeats?.includes(seatStr);
              const isLocked = show.lockedSeats?.some((s) => s.seat === seatStr);
              const isSelected = selectedSeats.includes(seatStr);
              let seatColor = "bg-white border border-gray-400";
              if (isBooked) seatColor = "bg-gray-400";
              else if (isSelected) seatColor = "bg-blue-500 text-white";
              else if (isLocked) seatColor = "bg-yellow-400";
              return (
                <Motion.div
                  key={seatStr}
                  onClick={() => !isBooked && handleSeatClick(seatStr)}
                  whileHover={!isBooked ? { scale: 1.1 } : {}}
                  className={seatColor + " w-8 h-8 sm:w-10 sm:h-10 rounded-md flex flex-col items-center justify-center text-[10px] sm:text-xs font-semibold cursor-pointer shadow-sm"}
                >
                  <div>{seatStr}</div>
                  {lockTimers[seatStr] && <div className="text-[8px] sm:text-[9px]">{lockTimers[seatStr]}s</div>}
                </Motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {selectedSeats.length > 0 && (
        <div className="mt-10 text-center">
          <Motion.button whileHover={{ scale: 1.05 }} onClick={handleBookSeat} className="bg-[#8b1e3f] hover:bg-[#b02a4f] text-white px-8 sm:px-10 py-3 rounded-xl font-semibold shadow-lg transition w-full sm:w-auto">
            Book {selectedSeats.length} Seat(s) - Rs. {selectedSeats.length * show.price}
          </Motion.button>
        </div>
      )}

      {showPopup && (
        <Motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-6 right-4 sm:right-6 z-50">
          <div className="bg-green-600 text-white px-5 py-4 rounded-lg shadow-xl w-64 sm:w-72">
            <h3 className="font-bold text-lg mb-1">Booking Confirmed</h3>
            <p className="text-sm">Seats: {lastBookedSeats.join(", ")}</p>
            <p className="text-sm">Total: Rs. {lastBookedSeats.length * show.price}</p>
          </div>
        </Motion.div>
      )}
    </Motion.div>
  );
}

export default SeatPage;

