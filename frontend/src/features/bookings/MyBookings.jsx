import { useEffect, useState } from "react";
import MovieCard from "../movies/MovieCard.jsx";
import { motion } from "framer-motion";
import API from "../../services/api";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await API.get("/booking/my");
        if (res?.data) {
          setBookings(res.data);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error("Booking fetch error:", err.response?.data || err.message);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5efe6]">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[#7a3e1d] text-lg sm:text-xl"
        >
          Loading bookings...
        </motion.p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-[#f5efe6] px-4 sm:px-6 lg:px-12 py-8 sm:py-12"
    >
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-[#7a3e1d] mb-8 sm:mb-12"
      >
        My Bookings
      </motion.h1>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-6 sm:space-y-8"
      >
        {bookings.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 bg-white p-6 sm:p-10 rounded-xl shadow"
          >
            No bookings found
          </motion.div>
        )}
        
        {bookings.map((b) => (
          <motion.div
            key={b._id}
            variants={itemVariants}
            whileHover={{ scale: 1.01, y: -3 }}
            className="bg-white border border-[#e7dac8] rounded-xl shadow-md hover:shadow-lg transition flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6"
          >
<div className="w-full sm:w-36 h-48 flex-shrink-0 pointer-events-none overflow-hidden rounded-lg">
              <MovieCard movie={b.movie || {}} />
            </div>
            <div className="flex-1 space-y-2 sm:space-y-3">

              <p className="text-gray-600 text-sm sm:text-base">
                Theatre: <span className="font-semibold">{b.show?.theatre?.name || "N/A"}</span>
              </p>
              <p className="text-gray-600 text-sm sm:text-base">
                Location: <span className="font-semibold">{b.show?.theatre?.location || "N/A"}</span>
              </p>
              <p className="text-gray-600 text-sm sm:text-base">
                Show Time: <span className="font-semibold">{b.show?.showTime ? new Date(b.show.showTime).toLocaleString() : 'N/A'}</span> | Seats: <span className="font-semibold">{b.seats?.join(', ') || 'N/A'}</span> | Price: ₹<span className="font-semibold">{b.totalPrice || 0}</span>
              </p>

              <div className="pt-2">
                <span className="bg-[#8b1e3f] text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm">Confirmed</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

export default MyBookings;

