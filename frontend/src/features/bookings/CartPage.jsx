import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { bookSeats } from "../../services/api";
import { toast } from "react-toastify";

export default function CartPage() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pendingCart");
      if (!raw) {
        setCart(null);
      } else {
        const parsed = JSON.parse(raw);
        setCart(parsed);
      }
    } catch (e) {
      setError("Failed to load cart");
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const seatsCount = cart?.seats?.length || 0;
  const total = useMemo(() => {
    const price = Number(cart?.price || 0);
    return seatsCount * price;
  }, [seatsCount, cart]);

  const handleBookTickets = async () => {
    if (!cart?.showId || !cart?.seats?.length) {
      setError("Cart is missing showId or seats");
      return;
    }

    try {
      setError(null);
      await bookSeats(cart.showId, cart.seats);

      const movieName = cart.movieName || "Movie";
      const timing = cart.showTime || "Timing";
      const seatNames = cart.seats?.join(", ") || "Seats";

      localStorage.removeItem("pendingCart");

      toast.success(
        `Booking successful!\n${movieName}\nSeats: ${seatNames}\nTiming: ${timing}`,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: true,
          theme: "colored"
        }
      );

      // Redirect after toast
      navigate("/my-bookings", {
        state: { bookingToast: { movieName, timing, seatNames } }
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Booking failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5efe6]">
        <p className="text-[#7a3e1d] text-lg">Loading cart...</p>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5efe6] p-4">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-[#7a3e1d] mb-3">Cart is empty</h1>
          <p className="text-gray-600 mb-5">Select seats to proceed.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-[#8b1e3f] hover:bg-[#b02a4f] text-white px-6 py-3 rounded-xl font-bold"
          >
            Go to Movies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5efe6] px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-[#7a3e1d] mb-6">
          Checkout Cart
        </h1>

        <div className="bg-white rounded-2xl shadow-xl border border-[#e7dac8] overflow-hidden">
          {/* Header / hero */}
          <div className="bg-gradient-to-r from-[#5b0f1b] to-[#8b1e3f] px-4 sm:px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a3 3 0 00-3 3v8a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5z" />
                  <path d="M3 9h14" />
                </svg>
              </div>
              <div>
                <p className="text-white/90 text-sm sm:text-base">Ready to book your seats?</p>
                <p className="text-white font-extrabold text-lg sm:text-xl leading-tight">{cart.movieName || "Movie"}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-5">
              {/* Poster */}
              <div className="w-full sm:w-44 sm:flex-shrink-0 flex justify-center sm:justify-start">
                <div className="relative w-[180px] sm:w-[160px] rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={cart.moviePoster || cart.poster || cart.image || "https://picsum.photos/240/360"}
                    alt={cart.movieName || "Movie poster"}
                    onError={(e) => {
                      e.currentTarget.src = "https://picsum.photos/240/360";
                    }}
                    className="w-full aspect-[2/3] object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-black/40 text-white text-xs sm:text-sm">
                    Poster Preview
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-[#f5efe6] rounded-xl border border-[#e7dac8] p-3">
                    <p className="text-gray-600 text-sm">Timing</p>
                    <p className="font-semibold text-gray-900">{cart.showTime || "N/A"}</p>
                  </div>
                  <div className="bg-[#f5efe6] rounded-xl border border-[#e7dac8] p-3">
                    <p className="text-gray-600 text-sm">Theatre</p>
                    <p className="font-semibold text-gray-900">{cart.theatreName || "N/A"}</p>
                  </div>
                  <div className="bg-[#f5efe6] rounded-xl border border-[#e7dac8] p-3 sm:col-span-2">
                    <p className="text-gray-600 text-sm">Seats</p>
                    <p className="font-semibold text-gray-900">{cart.seats?.join(", ") || "N/A"}</p>
                  </div>
                  <div className="bg-[#f5efe6] rounded-xl border border-[#e7dac8] p-3">
                    <p className="text-gray-600 text-sm">Price / seat</p>
                    <p className="font-semibold text-gray-900">₹{cart.price || 0}</p>
                  </div>
                  <div className="bg-[#f5efe6] rounded-xl border border-[#e7dac8] p-3">
                    <p className="text-gray-600 text-sm">Total</p>
                    <p className="font-extrabold text-[#7a3e1d] text-lg">₹{total}</p>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
                    {error}
                  </div>
                )}

                {/* CTA */}
                <div className="pt-2">
                  <button
                    onClick={handleBookTickets}
                    className="w-full bg-[#5b0f1b] hover:bg-[#8b1e3f] text-white font-bold rounded-xl py-3 px-6 shadow-xl hover:shadow-2xl transition-all text-sm sm:text-base flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0z" />
                      <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-4a1 1 0 01-1-1V6a1 1 0 011-1z" fill="#fff" />
                    </svg>
                    Book Tickets
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 text-center pt-1">
                  You’ll see the booking details after confirmation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

