import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import API from "../../services/api";

function ShowsPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const res = await API.get("/shows/movie/" + movieId);
        setShows(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchShows();
  }, [movieId]);

  // Skeleton loader for showtimes
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f3e9] px-4 sm:px-6 py-8 md:py-14">
        <div className="max-w-6xl mx-auto">
          {/* Title skeleton */}
          <div className="h-10 w-48 bg-gray-300 animate-pulse rounded mx-auto mb-8 md:mb-12" />

          {/* Showtime cards skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="bg-white/70 backdrop-blur-lg border border-[#e0d6c5] rounded-xl p-4 sm:p-6">
                <div className="h-6 w-16 bg-gray-300 animate-pulse rounded mx-auto mb-2" />
                <div className="h-4 w-12 bg-gray-300 animate-pulse rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Group shows by time - use ISO string for reliable comparison
  const groupedByTime = shows.reduce((acc, show) => {
    const date = new Date(show.showTime);
    // Format as HH:MM (24-hour) with zero padding
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const time = `${hours}:${minutes}`;
    if (!acc[time]) acc[time] = [];
    acc[time].push(show);
    return acc;
  }, {});

  const timeEntries = Object.entries(groupedByTime);

  return (
    <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#f8f3e9] px-4 sm:px-6 py-8 md:py-14">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-[#6b3e26] mb-8 md:mb-12">
        Select Showtime
      </h1>

      {/* Show all times - click to navigate to theatre page */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 max-w-6xl mx-auto">
        {timeEntries.map(([time, timeShows], idx) => (
          <Motion.div
            key={time}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            onClick={() => navigate(`/theatres/${movieId}?time=${time}`)}
            className="bg-white/70 backdrop-blur-lg border border-[#e0d6c5] rounded-xl p-4 sm:p-6 cursor-pointer text-center shadow-md hover:shadow-xl transition-all"
          >
            <p className="text-lg sm:text-xl font-bold text-[#4b2e1e]">{time}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{timeShows.length} Theatres</p>
          </Motion.div>
        ))}
      </div>

      {shows.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No shows available for this movie</p>
        </div>
      )}
    </Motion.div>
  );
}

export default ShowsPage;
