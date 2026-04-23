import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import API from "../../services/api";

function TheatreListPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const res = await API.get("/shows/movie/" + movieId);
        // Show all shows for this movie (theatre selection)
        const filtered = res.data
          .filter((show) => show && show.showTime && show.theatre);
        setShows(filtered);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchShows();
  }, [movieId]);

  // Skeleton loader for theatre list
  if (loading) {
    return (
      <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#f8f3e9] px-4 sm:px-6 py-8 md:py-14">
        <div className="max-w-4xl mx-auto">
          {/* Title skeleton */}
          <div className="h-10 w-64 bg-gray-300 animate-pulse rounded mx-auto mb-8 md:mb-12" />

          {/* Theatre cards skeleton */}
          <div className="space-y-4 sm:space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white border border-[#e5dccb] p-4 sm:p-6 rounded-xl">
                <div className="h-6 w-48 bg-gray-300 animate-pulse rounded mb-2" />
                <div className="h-4 w-32 bg-gray-300 animate-pulse rounded mb-3" />
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-gray-300 animate-pulse rounded" />
                  <div className="h-4 w-24 bg-gray-300 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Motion.div>
    );
  }

  return (
    <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#f8f3e9] px-4 sm:px-6 py-8 md:py-14">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-[#6b3e26] mb-8 md:mb-12">
        Available Theatres
      </h1>
      <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        {shows.length === 0 && <p className="text-center text-gray-500 text-sm sm:text-base">No theatres available</p>}
        {shows.map((show, idx) => {
          const totalSeats = show.theatre.totalSeats;
          const booked = show.bookedSeats?.length || 0;
          const availableSeats = totalSeats - booked;
          return (
            <Motion.div
              key={show._id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate(`/seat/${show._id}`)}
              className="bg-white border border-[#e5dccb] p-4 sm:p-6 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer"


            >
              <h2 className="text-base sm:text-lg font-bold text-[#4b2e1e]">{show.theatre.name}</h2>
              <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">{show.theatre.location}</p>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                <p className="text-pink-600 font-semibold text-sm sm:text-base">Price: Rs. {show.price}</p>
                <p className={`text-xs sm:text-sm font-semibold ${availableSeats < 20 ? "text-red-500" : "text-green-600"}`}>{availableSeats} Seats Available</p>
              </div>
            </Motion.div>
          );
        })}
      </div>
    </Motion.div>
  );
}

export default TheatreListPage;

