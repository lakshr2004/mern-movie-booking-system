import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { bookSeats } from "../../services/api";

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
  }, [cart, seatsCount]);

  const handleBookTickets = async () => {
    if (!cart?.showId || !cart?.seats?.length) {
      setError("Cart is missing showId or seats");
      return;
    }

    try {
      setError(null);
      await bookSeats(cart.showId, cart.seats);
      localStorage.removeItem("pendingCart");
      navigate("/my-bookings");
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
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-[#7a3e1d] mb-8">
          Cart
        </h1>

        <div className="bg-white rounded-xl shadow border border-[#e7dac8] p-4 sm:p-6">
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm sm:text-base">
                Movie: <span className="font-semibold text-gray-900">{cart.movieName || "N/A"}</span>
              </p>
            </div>

            <div>
              <p className="text-gray-600 text-sm sm:text-base">
                Timing: <span className="font-semibold text-gray-900">{cart.showTime || "N/A"}</span>
              </p>
            </div>

            <div>
              <p className="text-gray-600 text-sm sm:text-base">
                Theatre: <span className="font-semibold text-gray-900">{cart.theatreName || "N/A"}</span>
              </p>
            </div>

            <div>
              <p className="text-gray-600 text-sm sm:text-base">
                Seats: <span className="font-semibold text-gray-900">{cart.seats?.join(", ") || "N/A"}</span>
              </p>
            </div>

            <div>
              <p className="text-gray-600 text-sm sm:text-base">
                Price (per seat): <span className="font-semibold text-gray-900">₹{cart.price || 0}</span>
              </p>
            </div>

            <div className="pt-2">
              <p className="text-[#7a3e1d] font-bold text-lg sm:text-xl">
                Total: ₹{total}
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
              {error}
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleBookTickets}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-xl py-3 px-6 shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
            >
              Book Tickets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

