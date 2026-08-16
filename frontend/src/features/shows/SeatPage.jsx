import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { lockSeats, unlockSeats, getShowSeats, getShowSeatsStatus } from "../../services/api";
import { connectSocket, joinShow } from "../../services/socket";

const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

export default function SeatPage() {
  const { showId } = useParams();
  const navigate = useNavigate();

  const [selected, setSelected] = useState([]);
  const [seats, setSeats] = useState({});
  const [showData, setShowData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Current user (handle both id and _id formats from auth token/payload)
  const userObj = JSON.parse(localStorage.getItem("user"));
  const currentUser = userObj?.user?.id || userObj?.user?._id || userObj?.id || userObj?._id;

  // ================= LOAD SHOW + SEATS =================
  useEffect(() => {
    const loadShow = async () => {
      try {
        const [showRes, seatsRes] = await Promise.all([
          getShowSeats(showId),
          getShowSeatsStatus(showId)
        ]);
        const showDataVal = showRes.data;
        const seatsDataVal = seatsRes.data;

        setShowData({
          movieName: showDataVal.movie?.title,
          moviePoster: showDataVal.movie?.poster,
          theatreName: showDataVal.theatre?.name,
          showTime: new Date(showDataVal.showTime).toLocaleString(),
          price: showDataVal.price
        });

        setSeats(seatsDataVal.seatsStatus || {});
        const bookedSeatIds = Object.keys(seatsDataVal.seatsStatus || {}).filter(
          s => seatsDataVal.seatsStatus[s]?.status === "BOOKED"
        );
        setSelected(prev => prev.filter(s => !bookedSeatIds.includes(s)));
      } catch (err) {
        console.error("Failed to load show seats details:", err);
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

      if (lockedBy !== currentUser) {
        setSelected(prev => prev.filter(s => !seats.includes(s)));
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
  }, [showId, currentUser]);

  // ================= CLICK =================
  const handleClick = async (seatId) => {
    const seat = seats[seatId];
    const isSelected = selected.includes(seatId);

    if (seat?.status === "BOOKED") return;
    if (seat?.status === "LOCKED" && seat.lockedBy !== currentUser) return;

    try {
      if (isSelected) {
        await unlockSeats(showId, [seatId]);
        setSelected(prev => prev.filter(s => s !== seatId));
        setSeats(prev => ({
          ...prev,
          [seatId]: { status: "AVAILABLE" }
        }));
      } else {
        const res = await lockSeats(showId, [seatId]);
        if (res.data.success) {
          setSelected(prev => [...prev, seatId]);
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

    const pendingCart = {
      showId,
      seats: selected,
      movieName: showData?.movieName || null,
      moviePoster: showData?.moviePoster || null,
      theatreName: showData?.theatreName || null,
      showTime: showData?.showTime || null,
      price: showData?.price || 0
    };
    localStorage.setItem("pendingCart", JSON.stringify(pendingCart));

    navigate("/cart");
  };

  // ================= STYLE =================
  const getStyle = (seatId) => {
    const seat = seats[seatId];
    const isSelected = selected.includes(seatId);
    const isMine = seat?.lockedBy === currentUser;

    if (seat?.status === "BOOKED") {
      return "bg-gray-900 text-white cursor-not-allowed";
    }

    if (isSelected || (seat?.status === "LOCKED" && isMine)) {
      return "bg-[#8b1e3f] text-white border border-[#5b0f1b]";
    }

    if (seat?.status === "LOCKED" && !isMine) {
      return "bg-amber-500 text-white border border-amber-600 cursor-not-allowed";
    }

    return "bg-[#e6f4ea] border border-[#a3cfbb] text-[#137333] hover:bg-[#d2ebd9]";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f3e9] flex items-center justify-center p-4">
        <div className="text-center font-bold text-[#5b0f1b]">Loading seats...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f3e9] p-3 sm:p-4 md:p-6 lg:p-8 pb-32">

      {/* HEADER */}
      <div className="max-w-4xl mx-auto mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#5b0f1b] mb-1.5 leading-tight">
          {showData?.movieName}
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-700 mb-3 font-medium">
          📍 {showData?.theatreName} • 🕒 {showData?.showTime}
        </p>

        {/* PRICE SUMMARY CARD */}
        <div className="mt-3 flex justify-center">
          <div className="bg-white shadow-md rounded-2xl p-3 sm:p-4 flex items-center justify-around border border-[#e7dac8] w-full max-w-sm sm:max-w-md mx-auto">
            <div className="text-center">
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium">Price/Seat</p>
              <p className="text-sm sm:text-base font-bold text-gray-800">
                ₹{showData?.price}
              </p>
            </div>

            <div className="h-6 w-px bg-gray-200"></div>

            <div className="text-center">
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium">Selected</p>
              <p className="text-sm sm:text-base font-bold text-gray-800">
                {selected.length} Seats
              </p>
            </div>

            <div className="h-6 w-px bg-gray-200"></div>

            <div className="text-center">
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium">Total</p>
              <p className="text-base sm:text-lg font-black text-[#8b1e3f]">
                ₹{selected.length * (showData?.price || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SEAT LEGEND */}
      <div className="flex justify-center gap-3 sm:gap-6 mb-6 text-xs sm:text-sm flex-wrap text-gray-700 font-medium max-w-2xl mx-auto">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 bg-[#e6f4ea] border border-[#a3cfbb] rounded-md"></div>
          <span>Available</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 bg-[#8b1e3f] rounded-md"></div>
          <span>Selected</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 bg-amber-500 rounded-md"></div>
          <span>Locked</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 bg-gray-900 rounded-md"></div>
          <span>Booked</span>
        </div>
      </div>

      {/* CINEMA SCREEN INDICATOR */}
      <div className="max-w-sm sm:max-w-md mx-auto mb-6 sm:mb-8 text-center">
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-[#8b1e3f] to-transparent rounded-full shadow-[0_4px_12px_rgba(139,30,63,0.3)]"></div>
        <p className="text-center text-[10px] sm:text-xs text-[#8b1e3f] font-black uppercase tracking-[0.2em] mt-2">
          SCREEN THIS WAY
        </p>
      </div>

      {/* SEAT GRID CONTAINER (RESPONSIVE CONTAINMENT & ACCESSIBLE TOUCH TARGETS) */}
      <div className="w-full max-w-4xl mx-auto overflow-x-auto scrollbar-hide py-2 px-1">
        <div className="min-w-[390px] flex flex-col gap-1.5 sm:gap-2 items-center">
          {rows.map(row => (
            <div key={row} className="flex justify-center gap-1 sm:gap-1.5 md:gap-2 w-full">
              {Array.from({ length: 10 }, (_, i) => {
                const seatId = `${row}${i + 1}`;

                return (
                  <button
                    key={seatId}
                    onClick={() => handleClick(seatId)}
                    className={`w-9 sm:w-10 md:w-11 h-9 sm:h-10 md:h-11 rounded-lg font-bold text-xs md:text-sm shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 ${getStyle(seatId)}`}
                  >
                    {seatId}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#faf7f2]/95 backdrop-blur-md border-t border-[#e7dac8] p-3 sm:p-4 shadow-lg flex items-center justify-between max-w-full">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium truncate">Selected Seats</p>
            {/* Compact summary for mobile */}
            <p className="sm:hidden text-xs font-black text-[#5b0f1b] truncate">
              {selected.length === 0
                ? "None"
                : selected.length > 2
                ? `${selected.length} Seats (${selected.slice(0, 2).join(", ")}...)`
                : selected.join(", ")}
            </p>
            {/* Fuller summary for tablet/desktop */}
            <p className="hidden sm:block text-sm md:text-base font-black text-[#5b0f1b] truncate">
              {selected.length === 0
                ? "None"
                : selected.length > 4
                ? `${selected.slice(0, 3).join(", ")} +${selected.length - 3} more`
                : selected.join(", ")}
            </p>
          </div>

          <button
            onClick={handleProceedToCheckout}
            disabled={!selected.length}
            className="px-4 sm:px-8 py-2.5 sm:py-3 bg-[#8b1e3f] hover:bg-[#5b0f1b] text-white font-extrabold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-xl transition-all text-xs sm:text-sm md:text-base cursor-pointer shrink-0"
          >
            Proceed to Book (₹{selected.length * (showData?.price || 0)})
          </button>
        </div>
      </div>

    </div>
  );
}