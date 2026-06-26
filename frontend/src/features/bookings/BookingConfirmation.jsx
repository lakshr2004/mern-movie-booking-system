import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt, FaReceipt } from "react-icons/fa";

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  useEffect(() => {
    // If someone tries to navigate to this page directly without booking data, redirect
    if (!booking) {
      navigate("/my-bookings");
    }
  }, [booking, navigate]);

  if (!booking) return null;

  const movie = booking.movie;
  const show = booking.show;
  const showTime = show?.showTime ? new Date(show.showTime).toLocaleString() : "N/A";
  const seats = booking.seats?.join(", ") || "";
  const seatsCount = booking.seats?.length || 0;

  // Read pricing details from state with robust fallbacks
  const displayConvenienceFee = location.state?.convenienceFee !== undefined ? location.state.convenienceFee : 30;
  const displayCgst = location.state?.cgst !== undefined ? location.state.cgst : parseFloat(((seatsCount * (show?.price || 0) + 30) * 0.09).toFixed(2));
  const displaySgst = location.state?.sgst !== undefined ? location.state.sgst : parseFloat(((seatsCount * (show?.price || 0) + 30) * 0.09).toFixed(2));
  const displayTicketPrice = seatsCount * (show?.price || 0);
  const displayTotalAmount = location.state?.totalAmount !== undefined ? location.state.totalAmount : (booking.totalPrice || (displayTicketPrice + displayConvenienceFee + displayCgst + displaySgst));

  return (
    <div className="min-h-screen bg-[#f8f3e9] flex items-center justify-center p-4 sm:p-6 lg:p-12 text-[#2e1c14]">
      <div className="max-w-xl w-full bg-[#faf7f2] rounded-3xl shadow-2xl border border-[#e7dac8] overflow-hidden transform transition-all hover:scale-[1.01]">
        
        {/* Animated Header / Success Banner (Light Theme with Maroon Accents) */}
        <div className="bg-[#fbf9f5] border-b border-[#e7dac8] p-8 text-center text-[#2e1c14] relative overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#8b1e3f_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          {/* Success Checkmark Animation */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-white border border-[#e7dac8] rounded-full flex items-center justify-center animate-bounce shadow-sm">
              <FaCheckCircle className="w-12 h-12 text-[#8b1e3f] animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 uppercase text-[#8b1e3f]">Booking Confirmed!</h1>
          <p className="text-[#4b2e1e] text-sm sm:text-base">
            Your movie tickets are ready. Show this confirmation at the counter.
          </p>
        </div>

        {/* Booking Details Card Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Movie Details Grid */}
          <div className="flex gap-4 sm:gap-6 border-b border-[#e7dac8] pb-6">
            <div className="w-24 sm:w-28 flex-shrink-0">
              <img
                src={movie?.poster || movie?.image || movie?.posterUrl || "https://picsum.photos/240/360"}
                alt={movie?.title}
                onError={(e) => {
                  e.currentTarget.src = "https://picsum.photos/240/360";
                }}
                className="w-full aspect-[2/3] object-cover rounded-2xl shadow-md border border-[#e7dac8]"
              />
            </div>
            <div className="flex-1 space-y-2 py-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-[#5b0f1b] leading-tight">
                  {movie?.title}
                </h2>
                <span className="bg-[#8b1e3f]/20 border border-[#8b1e3f]/30 text-[#8b1e3f] text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                  2D
                </span>
              </div>
              <p className="inline-block bg-[#8b1e3f]/15 border border-[#8b1e3f]/25 text-[#8b1e3f] font-bold text-xs px-2.5 py-0.5 rounded-md">
                {movie?.genre || "Action/Drama"}
              </p>
              <div className="space-y-1 pt-1">
                <div className="flex items-center gap-2 text-sm text-[#4b2e1e]">
                  <FaCalendarAlt className="text-[#8b1e3f] w-4" />
                  <span>{showTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#4b2e1e]">
                  <FaMapMarkerAlt className="text-[#8b1e3f] w-4" />
                  <span>{show?.theatre?.name || "Theatre Details"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Information */}
          <div className="grid grid-cols-2 gap-4 border-b border-[#e7dac8] pb-6 bg-[#fbf9f5] p-4 rounded-2xl border border-[#e7dac8]">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-[#4b2e1e] uppercase tracking-wider flex items-center gap-1.5">
                <FaTicketAlt className="text-[#8b1e3f]" /> Seats Booked
              </p>
              <p className="text-base sm:text-lg font-black text-[#8b1e3f]">{seats}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-[#4b2e1e] uppercase tracking-wider">
                Total Tickets
              </p>
              <p className="text-base sm:text-lg font-black text-[#5b0f1b]">
                {seatsCount} {seatsCount === 1 ? "Ticket" : "Tickets"}
              </p>
            </div>
          </div>

          {/* Price Breakdown paid */}
          <div className="bg-[#fbf9f5] border border-[#e7dac8] rounded-2xl p-4 space-y-2.5">
            <h3 className="text-xs font-black text-[#4b2e1e] uppercase tracking-wider">Price Details Paid</h3>
            <div className="flex justify-between text-sm text-[#4b2e1e]">
              <span>Ticket Price ({seatsCount} × ₹{show?.price || 0})</span>
              <span className="font-semibold text-[#2e1c14]">₹{displayTicketPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#4b2e1e]">
              <span>Convenience Fee</span>
              <span className="font-semibold text-[#2e1c14]">₹{displayConvenienceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#4b2e1e] pl-3">
              <span>CGST Paid (9%)</span>
              <span>₹{displayCgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#4b2e1e] pl-3">
              <span>SGST Paid (9%)</span>
              <span>₹{displaySgst.toFixed(2)}</span>
            </div>
            <div className="border-t border-[#e7dac8] pt-2.5 flex justify-between items-center text-sm">
              <span className="font-bold text-[#2e1c14]">Final Total Paid</span>
              <span className="text-lg font-black text-[#8b1e3f]">₹{displayTotalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Transaction Metadata */}
          <div className="bg-[#fbf9f5] border border-[#e7dac8] rounded-2xl p-4 space-y-2.5">
            <h3 className="text-xs font-bold text-[#4b2e1e] uppercase tracking-wider flex items-center gap-1.5">
              <FaReceipt className="text-[#8b1e3f]" /> Transaction Summary
            </h3>
            <div className="flex justify-between text-sm text-[#4b2e1e]">
              <span>Order ID:</span>
              <span className="font-mono font-semibold bg-[#f5efe6] text-[#5b0f1b] px-2 py-0.5 rounded text-xs">{booking.razorpay_order_id}</span>
            </div>
            <div className="flex justify-between text-sm text-[#4b2e1e]">
              <span>Payment ID:</span>
              <span className="font-mono font-semibold bg-[#f5efe6] text-[#5b0f1b] px-2 py-0.5 rounded text-xs">{booking.razorpay_payment_id}</span>
            </div>
          </div>

          {/* Call-to-action buttons */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={() => navigate("/my-bookings")}
              className="w-full bg-[#8b1e3f] hover:bg-[#5b0f1b] text-white font-bold py-3.5 px-4 rounded-xl transition-all text-sm text-center cursor-pointer shadow-md hover:shadow-lg"
            >
              View My Bookings
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-transparent border border-[#8b1e3f] text-[#8b1e3f] hover:bg-[#f5efe6] font-bold py-3.5 px-4 rounded-xl transition-all text-sm text-center cursor-pointer shadow-sm"
            >
              Go to Home
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
