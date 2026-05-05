import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { lockSeats, unlockSeats, bookSeats, getShowSeats } from "../../services/api";
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
  const currentUser = JSON.parse(localStorage.getItem("user"))?.id;

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
          seatMap[seat] = { status: "LOCKED" };
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
          updated[seat] = { status: "LOCKED", lockedBy };
        });
        return updated;
      });

      setSelected(prev => prev.filter(s => !seats.includes(s)));
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

    return () => socket.disconnect();
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

  // ================= BOOK =================
  const handleBook = async () => {
    if (!selected.length) return;

    try {
      await bookSeats(showId, selected);

      alert("Booking successful 🎉");

      setSelected([]);
      navigate("/my-bookings");
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    }
  };

  // ================= STYLE =================
  const getStyle = (seatId) => {
    const seat = seats[seatId];
    const isSelected = selected.includes(seatId);
    const isMine = seat?.lockedBy === currentUser;

    // 🟡 YOUR selection
    if (isSelected) {
      return "bg-yellow-400 text-black";
    }

    // ⚫ booked (always)
    if (seat?.status === "BOOKED") {
      return "bg-gray-800 text-white cursor-not-allowed";
    }

    // ⚫ locked by others
    if (seat?.status === "LOCKED" && !isMine) {
      return "bg-gray-800 text-white cursor-not-allowed";
    }

    // 🟡 locked by you (fallback)
    if (seat?.status === "LOCKED" && isMine) {
      return "bg-yellow-400 text-black";
    }

    // ⚪ available
    return "bg-white border border-gray-300 hover:bg-gray-100";
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f8f8f8] p-6">

      {/* HEADER */}
      <div className="max-w-4xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {showData?.movieName}
        </h1>
        <p className="text-gray-600 mb-2">
          {showData?.theatreName} • {showData?.showTime}
        </p>
        {/* 💰 PRICE CARD */}
        <div className="mt-4 flex justify-center">
          <div className="bg-white shadow-lg rounded-xl px-6 py-4 flex items-center gap-6 border border-gray-200">

            {/* price per seat */}
            <div className="text-center">
              <p className="text-xs text-gray-500">Price</p>
              <p className="text-lg font-semibold text-gray-800">
                ₹{showData?.price}
              </p>
            </div>

            {/* divider */}
            <div className="h-8 w-px bg-gray-300"></div>

            {/* seats */}
            <div className="text-center">
              <p className="text-xs text-gray-500">Seats</p>
              <p className="text-lg font-semibold text-gray-800">
                {selected.length}
              </p>
            </div>

            {/* divider */}
            <div className="h-8 w-px bg-gray-300"></div>

            {/* total */}
            <div className="text-center">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold text-green-600">
                ₹{selected.length * (showData?.price || 0)}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* SCREEN */}
      <div className="text-center mb-6 text-gray-500">
        -------- SCREEN --------
      </div>

      {/* GRID */}
      <div className="space-y-2">
        {rows.map(row => (
          <div key={row} className="flex justify-center gap-2">
            {Array.from({ length: 10 }, (_, i) => {
              const seatId = `${row}${i + 1}`;

              return (
                <button
                  key={seatId}
                  onClick={() => handleClick(seatId)}
                  className={`w-10 h-10 rounded ${getStyle(seatId)}`}
                >
                  {seatId}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* BUTTON */}
      <div className="text-center mt-8">
        <button
          onClick={handleBook}
          disabled={!selected.length}
          className="px-6 py-3 bg-gray-800 text-white rounded disabled:opacity-40"
        >
          Book Seats
        </button>
      </div>

    </div>
  );
}