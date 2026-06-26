import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPaymentOrder, verifyPayment, cancelPaymentOrder } from "../../services/api";
import { toast } from "react-toastify";

export default function CartPage() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [activeTab, setActiveTab] = useState("card");

  const [showMockRazorpay, setShowMockRazorpay] = useState(false);
  const [mockOptions, setMockOptions] = useState(null);

  // Load Razorpay checkout script dynamically (or mock if dummy keys are used)
  useEffect(() => {
    const isMock = (import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_bookingKey123") === "rzp_test_bookingKey123";
    if (isMock) {
      window.Razorpay = function(options) {
        this.options = options;
        this.open = () => {
          const event = new CustomEvent("openMockRazorpay", { detail: this.options });
          window.dispatchEvent(event);
        };
      };
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    const handleOpenMock = (e) => {
      setMockOptions(e.detail);
      setShowMockRazorpay(true);
    };

    window.addEventListener("openMockRazorpay", handleOpenMock);
    return () => {
      window.removeEventListener("openMockRazorpay", handleOpenMock);
    };
  }, []);

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
  const price = Number(cart?.price || 0);

  // Cost calculations matching BookMyShow breakdown requirements
  const ticketPrice = seatsCount * price;
  const convenienceFee = 30;
  const taxableAmount = ticketPrice + convenienceFee;
  const cgst = parseFloat((taxableAmount * 0.09).toFixed(2));
  const sgst = parseFloat((taxableAmount * 0.09).toFixed(2));
  const totalAmount = ticketPrice + convenienceFee + cgst + sgst;

  const handlePaymentSuccess = async (response) => {
    try {
      setError(null);
      setProcessingPayment(true);

      const verifyRes = await verifyPayment({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
      });

      if (verifyRes.data.success) {
        localStorage.removeItem("pendingCart");
        toast.success("Payment successful! Tickets booked.", {
          position: "top-right",
          autoClose: 4500,
          theme: "colored"
        });
        
        navigate("/booking-confirmation", {
          state: { 
            booking: verifyRes.data.booking,
            convenienceFee,
            cgst,
            sgst,
            totalAmount
          }
        });
      } else {
        setError("Payment verification failed. Please contact support.");
      }
    } catch (verifyErr) {
      setError(verifyErr?.response?.data?.message || "Payment verification failed.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePaymentCancel = async (orderId) => {
    try {
      setError("Payment cancelled. Seats have been released.");
      await cancelPaymentOrder(orderId);
      toast.error("Payment cancelled. Seats have been released.", {
        position: "top-right",
        autoClose: 4000,
        theme: "colored"
      });
    } catch (cancelErr) {
      console.error("Error releasing seats after cancel:", cancelErr);
    }
  };

  const handleBookTickets = async () => {
    if (!cart?.showId || !cart?.seats?.length) {
      setError("Cart is missing showId or seats");
      return;
    }

    try {
      setError(null);
      setProcessingPayment(true);

      // 1. Create Razorpay order on backend with the totalAmount (in paise)
      const res = await createPaymentOrder(cart.showId, cart.seats, Math.round(totalAmount * 100));
      const { order, booking, prefill } = res.data;
      const user = JSON.parse(localStorage.getItem("user"))?.user || {};

      // 2. Configure Razorpay checkout options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_bookingKey123",
        amount: Math.round(totalAmount * 100),  // in paise
        currency: "INR",
        name: "TicketPeChalo",
        description: `${cart.movieName} - ${cart.seats.length} Ticket(s)`,
        image: "/logo.png",
        order_id: order.id,
        prefill: {
          name: user.name || prefill?.name || "Guest",
          email: user.email || prefill?.email || "",
          contact: user.phone || ""
        },
        notes: {
          movieName: cart.movieName,
          seats: cart.seats.join(", "),
          theatreName: cart.theatreName
        },
        theme: {
          color: "#8b1e3f"  // TicketPeChalo maroon theme
        },
        modal: {
          ondismiss: () => {
            handlePaymentCancel(order.id);
          }
        },
        handler: async (response) => {
          await handlePaymentSuccess(response);
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to initiate payment. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f3e9]">
        <p className="text-[#8b1e3f] text-lg animate-pulse font-bold tracking-wider">Loading cart...</p>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f3e9] p-4 text-[#5b0f1b]">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#e7dac8] max-w-md w-full text-center shadow-2xl">
          <h1 className="text-2xl font-black text-[#8b1e3f] mb-3 uppercase tracking-wide">Cart is empty</h1>
          <p className="text-gray-600 mb-6 text-sm">Please select your seats to proceed.</p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-[#8b1e3f] hover:bg-[#5b0f1b] text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl cursor-pointer"
          >
            Go to Movies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f3e9] text-gray-800 px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-4xl font-black text-center text-[#5b0f1b] mb-8 tracking-wide uppercase">
          Review & Pay
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT PANEL (60% width) - Payment Options */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-[#e7dac8] rounded-3xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-[#5b0f1b] mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#8b1e3f] rounded-full inline-block"></span>
                Select Payment Method
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Vertical Tabs Sidebar */}
                <div className="md:col-span-5 space-y-3">
                  {[
                    { id: "card", label: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay", icon: "💳" },
                    { id: "upi", label: "UPI / GPay / PhonePe", sub: "Instant bank transfer", icon: "📱" },
                    { id: "netbanking", label: "Net Banking", sub: "All major banks", icon: "🏦" },
                    { id: "wallets", label: "Mobile Wallets", sub: "Paytm, Mobikwik & more", icon: "💼" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-300 flex items-start gap-3 cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-[#8b1e3f]/10 border-[#8b1e3f] text-[#5b0f1b] shadow-md shadow-[#8b1e3f]/5"
                          : "bg-[#fdfcfb] border-[#e7dac8] text-gray-500 hover:text-[#5b0f1b] hover:border-[#8b1e3f]"
                      }`}
                    >
                      <span className="text-2xl py-1">{tab.icon}</span>
                      <div>
                        <p className="font-bold text-sm leading-snug">{tab.label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{tab.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Tab Content Preview */}
                <div className="md:col-span-7 bg-[#fdfcfb] border border-[#e7dac8] rounded-2xl p-5 flex flex-col justify-between min-h-[220px]">
                  {activeTab === "card" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm text-[#5b0f1b]">Credit / Debit Card</h4>
                        <span className="text-xs bg-[#8b1e3f]/10 text-[#8b1e3f] px-2 py-0.5 rounded font-medium border border-[#8b1e3f]/25">Secure</span>
                      </div>
                      <div className="space-y-2 text-xs text-gray-600">
                        <p>• Pay securely using Visa, Mastercard, RuPay, or Maestro.</p>
                        <p>• Save your card details for faster checkouts later.</p>
                        <p>• 100% encrypted, tokenized card payments.</p>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2 opacity-80">
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-[10px] font-mono font-bold">VISA</span>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-[10px] font-mono font-bold">MASTERCARD</span>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-[10px] font-mono font-bold">RUPAY</span>
                      </div>
                    </div>
                  )}

                  {activeTab === "upi" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm text-[#5b0f1b]">UPI / BHIM</h4>
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded font-medium border border-green-200">Instant</span>
                      </div>
                      <div className="space-y-2 text-xs text-gray-600">
                        <p>• Enter your UPI ID (VPA) or scan the QR code to pay instantly.</p>
                        <p>• Works with Google Pay, PhonePe, Paytm, BHIM, and iMobile.</p>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2 opacity-80">
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-[10px] font-mono font-bold">GPAY</span>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-[10px] font-mono font-bold">PHONEPE</span>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-[10px] font-mono font-bold">PAYTM</span>
                      </div>
                    </div>
                  )}

                  {activeTab === "netbanking" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm text-[#5b0f1b]">Net Banking</h4>
                        <span className="text-xs bg-[#8b1e3f]/10 text-[#8b1e3f] px-2 py-0.5 rounded font-medium border border-[#8b1e3f]/25">All Banks</span>
                      </div>
                      <div className="space-y-2 text-xs text-gray-600">
                        <p>• Secure redirection to your bank's retail internet banking portal.</p>
                        <p>• Major public & private sector banks supported.</p>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2 opacity-80">
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-[10px] font-mono font-bold">SBI</span>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-[10px] font-mono font-bold">HDFC</span>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-[10px] font-mono font-bold">ICICI</span>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-[10px] font-mono font-bold">AXIS</span>
                      </div>
                    </div>
                  )}

                  {activeTab === "wallets" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm text-[#5b0f1b]">Mobile Wallets</h4>
                        <span className="text-xs bg-[#8b1e3f]/10 text-[#8b1e3f] px-2 py-0.5 rounded font-medium border border-[#8b1e3f]/25">Fast Pay</span>
                      </div>
                      <div className="space-y-2 text-xs text-gray-600">
                        <p>• Quick link and check balance on popular mobile wallets.</p>
                        <p>• Paytm, Mobikwik, PhonePe Wallet support.</p>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2 opacity-80">
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-[10px] font-mono font-bold">PAYTM</span>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-[10px] font-mono font-bold">MOBIKWIK</span>
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-gray-500 italic mt-auto border-t border-[#e7dac8] pt-3">
                    All payment methods are available inside the secure checkout
                  </p>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Book & Pay CTA */}
            <button
              onClick={handleBookTickets}
              disabled={processingPayment}
              className="w-full bg-[#8b1e3f] hover:bg-[#5b0f1b] disabled:bg-[#8b1e3f]/50 text-white font-extrabold rounded-2xl py-4.5 px-6 shadow-xl hover:shadow-2xl disabled:shadow-none transition-all text-base flex items-center justify-center gap-3 cursor-pointer disabled:cursor-not-allowed uppercase tracking-wider"
            >
              {processingPayment ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Processing Checkout...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Book & Pay ₹{totalAmount.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>

          {/* RIGHT PANEL (40% width) - Booking & Price Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#e7dac8] rounded-3xl p-6 shadow-xl space-y-6">
              <h2 className="text-lg font-bold text-[#5b0f1b] flex items-center gap-2 border-b border-[#e7dac8] pb-4">
                <span className="w-2 h-6 bg-[#8b1e3f] rounded-full inline-block"></span>
                Order Summary
              </h2>

              {/* Movie info card */}
              <div className="flex gap-4 items-start">
                <div className="w-24 sm:w-28 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg border border-[#e7dac8]">
                  {cart.moviePoster ? (
                    <img
                      src={cart.moviePoster}
                      alt={cart.movieName}
                      onError={(e) => {
                        e.currentTarget.src = "https://picsum.photos/240/360";
                      }}
                      className="w-full aspect-[2/3] object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-[#fdfcfb] flex flex-col items-center justify-center text-center p-2 border border-[#e7dac8] rounded-xl">
                      <span className="text-3xl text-[#5b0f1b] font-black mb-1">
                        {cart.movieName?.charAt(0) || "M"}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">No Poster</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2 py-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold text-[#5b0f1b] text-lg sm:text-xl leading-tight">
                      {cart.movieName}
                    </h3>
                    <span className="bg-[#8b1e3f]/10 border border-[#8b1e3f]/25 text-[#8b1e3f] text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                      2D
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 font-medium">🏫 {cart.theatreName}</p>
                    <p className="text-xs text-gray-600 font-medium">⏰ {cart.showTime}</p>
                  </div>
                </div>
              </div>

              {/* Seats badge list */}
              <div className="border-t border-b border-[#e7dac8] py-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 uppercase font-black tracking-wider">Seats</span>
                  <span className="text-xs bg-[#8b1e3f]/10 text-[#8b1e3f] font-extrabold px-2 py-0.5 rounded-full border border-[#8b1e3f]/20">
                    {seatsCount} {seatsCount === 1 ? "Ticket" : "Tickets"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cart.seats?.map(seat => (
                    <span key={seat} className="bg-[#fdfcfb] border border-[#e7dac8] text-[#5b0f1b] text-xs font-bold px-2.5 py-1 rounded-lg">
                      {seat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price details table */}
              <div className="space-y-3.5 pt-1">
                <h3 className="text-xs text-gray-500 uppercase font-black tracking-wider">Price Details</h3>
                
                <div className="space-y-2.5 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Ticket Price ({seatsCount} × ₹{price})</span>
                    <span className="font-semibold text-gray-900">₹{ticketPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Convenience Fee</span>
                    <span className="font-semibold text-gray-900">₹{convenienceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 pl-3">
                    <span>CGST (9%)</span>
                    <span>₹{cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 pl-3">
                    <span>SGST (9%)</span>
                    <span>₹{sgst.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-[#e7dac8] pt-3.5 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">Total Payable</span>
                  <span className="text-xl font-black text-[#5b0f1b]">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mock Razorpay Modal Overlay */}
      {showMockRazorpay && mockOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-[#e7dac8] transform transition-all scale-100">
            {/* Header */}
            <div className="bg-[#5b0f1b] p-5 text-white flex justify-between items-center">
              <div>
                <p className="text-[10px] text-white/70 uppercase font-bold tracking-wider">Payment Gateway (Mock Mode)</p>
                <h3 className="text-lg font-extrabold">{mockOptions.name}</h3>
                <p className="text-xs text-white/80 mt-0.5">{mockOptions.description}</p>
              </div>
              <button 
                onClick={() => {
                  setShowMockRazorpay(false);
                  if (mockOptions.modal?.ondismiss) {
                    mockOptions.modal.ondismiss();
                  }
                }}
                className="text-white/80 hover:text-white text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-gray-800">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Amount to Pay</span>
                <span className="text-lg font-extrabold text-[#5b0f1b]">₹{mockOptions.amount / 100}</span>
              </div>

              {activeTab === "card" && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Enter Card Details</p>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Card Number</label>
                    <input
                      type="text"
                      defaultValue="4111 1111 1111 1111"
                      placeholder="4111 1111 1111 1111"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#5b0f1b] text-gray-800 font-mono"
                      id="mock-card-number"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        defaultValue="12/26"
                        placeholder="MM/YY"
                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#5b0f1b] text-gray-800 font-mono text-center"
                        id="mock-card-expiry"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">CVV</label>
                      <input
                        type="password"
                        defaultValue="123"
                        placeholder="123"
                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#5b0f1b] text-gray-800 font-mono text-center"
                        id="mock-card-cvv"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      defaultValue={mockOptions.prefill?.name || "Test User"}
                      placeholder="John Doe"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#5b0f1b] text-gray-800"
                      id="mock-card-name"
                    />
                  </div>
                </div>
              )}

              {activeTab === "upi" && (
                <div className="space-y-4 text-center py-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide text-left">Pay via UPI</p>
                  <div className="bg-white p-4 rounded-2xl inline-block shadow-md border border-gray-100">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=ticketpechalo@razor&pn=TicketPeChalo&am=200&cu=INR" 
                      alt="Mock UPI QR Code" 
                      className="w-32 h-32"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 text-left">Or enter UPI ID</label>
                    <input
                      type="text"
                      defaultValue="test@upi"
                      placeholder="username@bank"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#5b0f1b] text-gray-800 font-mono"
                    />
                  </div>
                </div>
              )}

              {activeTab === "netbanking" && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Net Banking Checkout</p>
                  <p className="text-xs text-gray-600">Please choose your preferred bank for redirect:</p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank"].map(bank => (
                      <button key={bank} className="bg-white border border-gray-200 hover:border-[#5b0f1b] rounded-xl py-2 px-3 text-xs text-gray-700 font-bold transition-all text-center">
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "wallets" && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Mobile Wallets</p>
                  <p className="text-xs text-gray-600">Select wallet to authorize payment:</p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {["Paytm Wallet", "Mobikwik Wallet", "PhonePe Wallet"].map(wallet => (
                      <button key={wallet} className="bg-white border border-gray-200 hover:border-[#5b0f1b] rounded-xl py-2 px-3 text-xs text-gray-700 font-bold transition-all text-center">
                        {wallet}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer / CTA */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  setShowMockRazorpay(false);
                  if (mockOptions.modal?.ondismiss) {
                    mockOptions.modal.ondismiss();
                  }
                }}
                className="flex-1 bg-white hover:bg-gray-100 text-gray-500 font-bold py-3 px-4 rounded-xl border border-gray-300 transition-all text-sm cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowMockRazorpay(false);
                  if (mockOptions.handler) {
                    const mockPaymentId = `pay_mock_${Math.random().toString(36).substring(2, 11)}`;
                    const mockSignature = `sig_mock_${Math.random().toString(36).substring(2, 11)}`;
                    mockOptions.handler({
                      razorpay_payment_id: mockPaymentId,
                      razorpay_order_id: mockOptions.order_id,
                      razorpay_signature: mockSignature
                    });
                  }
                }}
                className="flex-1 bg-[#5b0f1b] hover:bg-[#8b1e3f] text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm cursor-pointer text-center"
              >
                Pay ₹{mockOptions.amount / 100}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
