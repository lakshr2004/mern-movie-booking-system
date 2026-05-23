import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { lockSeats, unlockSeats, getShowSeats } from "../../services/api";

import { connectSocket, joinShow } from "../../services/socket";

const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

export default function SeatPage() {
  const { showId } = useParams();
  const navigate = useNavigate();

  const [selected, setSelected] = useState([]);
  const [seats, setSeats] = useState({});
  const [showData, setShowData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ current user
  const currentUser =
    JSON.parse(localStorage.getItem("user"))?.user?._id;

  // ================= LOAD SHOW + SEATS =================
  useEffect(() => {
    const loadShow = async () => {
      try {
        const res = await getShowSeats(showId);
        const data = res.data;

        // 🎬 show info
        setShowData({
          movieName: data.movie?.title,
          theatreName: data.theatre?.name,
          showTime: new Date(data.showTime).toLocaleString(),
          price: data.price
        });

        // 🔥 IMPORTANT: initialize seat state
        const seatMap = {};

        // 🔴 booked seats
        data.bookedSeats?.forEach(seat => {
          seatMap[seat] = { status: "BOOKED" };
        });

        // 🔒 locked seats (if backend sends)
        data.lockedSeats?.forEach(seat => {
          seatMap[seat.seatNumber] = {
            status: "LOCKED",
            lockedBy: seat.lockedBy
          };
        });

        setSeats(seatMap);

      } catch {
        alert("Failed to load show");
      } finally {
        setLoading(false);
      }
    };

    loadShow();
  }, [showId]);

  // ================= SOCKET =================
  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;

    joinShow(showId);

    socket.on("seatLocked", ({ seats, lockedBy }) => {
      setSeats(prev => {
        const updated = { ...prev };

        seats.forEach(seat => {
          updated[seat] = {
            status: "LOCKED",
            lockedBy
          };
        });

        return updated;
      });

      // ✅ REMOVE ONLY IF LOCKED BY OTHER USER
      if (lockedBy !== currentUser) {
        setSelected(prev =>
          prev.filter(s => !seats.includes(s))
        );
      }
    });

    socket.on("seatUnlocked", ({ seats }) => {
      setSeats(prev => {
        const updated = { ...prev };
        seats.forEach(seat => {
          updated[seat] = { status: "AVAILABLE" };
        });
        return updated;
      });

      setSelected(prev => prev.filter(s => !seats.includes(s)));
    });

    socket.on("seatBooked", ({ seats }) => {
      setSeats(prev => {
        const updated = { ...prev };
        seats.forEach(seat => {
          updated[seat] = { status: "BOOKED" };
        });
        return updated;
      });

      setSelected(prev => prev.filter(s => !seats.includes(s)));
    });

    return () => {
      socket.off("seatLocked");
      socket.off("seatUnlocked");
      socket.off("seatBooked");
      socket.disconnect();
    };
  }, [showId]);

  // ================= CLICK =================
  const handleClick = async (seatId) => {
    const seat = seats[seatId];
    const isSelected = selected.includes(seatId);

    // ❌ booked → ignore
    if (seat?.status === "BOOKED") return;

    // ❌ locked by others → ignore
    if (seat?.status === "LOCKED" && seat.lockedBy !== currentUser) return;

    try {
      // 🔁 DESELECT
      if (isSelected) {
        await unlockSeats(showId, [seatId]);

        setSelected(prev => prev.filter(s => s !== seatId));

        setSeats(prev => ({
          ...prev,
          [seatId]: { status: "AVAILABLE" }
        }));
      }
      // 🔒 SELECT
      else {
        const res = await lockSeats(showId, [seatId]);

        if (res.data.success) {
          setSelected(prev => [...prev, seatId]);

          // 🔥 instant UI update
          setSeats(prev => ({
            ...prev,
            [seatId]: { status: "LOCKED", lockedBy: currentUser }
          }));
        } else {
          alert(res.data.message);
        }
      }
    } catch {
      alert("Seat action failed");
    }
  };

  // ================= CART (Proceed to Checkout) =================
  const handleProceedToCheckout = () => {
    if (!selected.length) return;

    localStorage.setItem(
      "pendingCart",
      JSON.stringify({
        showId,
        seats: selected,
        // showData contains required info
        movieName: showData?.movieName || null,
        theatreName: showData?.theatreName || null,
        showTime: showData?.showTime || null,
        price: showData?.price || 0
      })
    );

    navigate("/cart");
  };

  // ================= STYLE =================
  const getStyle = (seatId) => {
    const seat = seats[seatId];
    const isSelected = selected.includes(seatId);
    const isMine = seat?.lockedBy === currentUser;

    // 🟡 YOUR selected/locked seat
    if (
      isSelected ||
      (seat?.status === "LOCKED" && isMine)
    ) {
      return "bg-yellow-400 text-black border border-yellow-500";
    }

    // ⚫ permanently booked
    if (seat?.status === "BOOKED") {
      return "bg-gray-900 text-white cursor-not-allowed";
    }

    // 🔒 locked by others
    if (seat?.status === "LOCKED" && !isMine) {
      return "bg-gray-500 text-white cursor-not-allowed";
    }

    // ⚪ available
    return "bg-white border border-gray-300 hover:bg-gray-100";
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-[#f8f8f8] p-3 sm:p-4 md:p-6 lg:p-8">

      {/* HEADER */}
      <div className="max-w-4xl mx-auto mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 leading-tight">
          {showData?.movieName}
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-2">
          {showData?.theatreName} • {showData?.showTime}
        </p>
        {/* 💰 PRICE CARD */}
        <div className="mt-4 flex justify-center">
          <div className="bg-white shadow-lg rounded-xl px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-center  sm:gap-4 border border-gray-200 w-full max-w-md mx-auto">

            {/* price per seat */}
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500">Price</p>
              <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
                ₹{showData?.price}
              </p>
            </div>

            {/* divider */}
            <div className="h-8 w-px bg-gray-300"></div>

            {/* seats */}
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500">Seats</p>
              <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
                {selected.length}
              </p>
            </div>

            {/* divider */}
            <div className="h-8 w-px bg-gray-300"></div>

            {/* total */}
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500">Total</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                ₹{selected.length * (showData?.price || 0)}
              </p>
            </div>

          </div>
        </div>
      </div>


      <div className="flex justify-center gap-6 mb-6 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
          <span>Available</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded"></div>
          <span>Your Seat</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-500 rounded"></div>
          <span>Locked</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-900 rounded"></div>
          <span>Booked</span>
        </div>
      </div>

      {/* SCREEN */}
      <div className="text-center mb-4 sm:mb-6 md:mb-8 text-xs sm:text-sm md:text-base text-gray-500 font-mono tracking-wider">
        -------- SCREEN --------
      </div>

      {/* GRID */}
      <div className="space-y-1.5 sm:space-y-2 md:space-y-2.5 max-w-4xl mx-auto">
        {rows.map(row => (
          <div key={row} className="flex justify-center gap-1 sm:gap-1.5 md:gap-2">
            {Array.from({ length: 10 }, (_, i) => {
              const seatId = `${row}${i + 1}`;

              return (
                <button
                  key={seatId}
                  onClick={() => handleClick(seatId)}
                  className={`min-w-[32px] w-8 sm:w-9 md:w-10 lg:w-11 h-8 sm:h-9 md:h-10 lg:h-11 rounded-lg font-medium text-xs sm:text-sm md:text-base shadow-sm hover:shadow-md active:scale-95 transition-all ${getStyle(seatId)}`}
                >
                  {seatId}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* BUTTON */}
      <div className="text-center mt-6 sm:mt-8 md:mt-10">
        <button
          onClick={handleProceedToCheckout}
          disabled={!selected.length}
          className="px-6 sm:px-8 py-2.5 sm:py-3 md:py-3.5 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all text-sm sm:text-base md:text-lg min-w-[220px]"
        >
          Proceed to Checkout
        </button>
      </div>

    </div>
  );
}