import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import API from "../../services/api";

function ShowsPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [movieId]);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        const res = await API.get("/movies/" + movieId);
        setMovie(res.data);
      } catch (error) {
        console.error("Error loading movie showtimes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [movieId]);

  const handleSelectShowtime = (time) => {
    navigate(`/theatres/${movieId}?time=${encodeURIComponent(time)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f3e9] px-4 py-8 max-w-5xl mx-auto space-y-6">
        <div className="h-28 bg-[#e7dac8]/50 animate-pulse rounded-3xl" />
        <div className="h-64 bg-[#e7dac8]/50 animate-pulse rounded-3xl" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#f8f3e9] flex items-center justify-center p-4">
        <div className="text-center bg-[#faf7f2] border border-[#e7dac8] p-8 rounded-2xl space-y-4">
          <h2 className="text-2xl font-bold text-[#5b0f1b]">Movie Not Found</h2>
          <button
            onClick={() => navigate("/")}
            className="bg-[#8b1e3f] text-white px-5 py-2.5 rounded-xl font-bold text-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Fallback showtimes if not present on movie
  const showtimeSlots = movie.showtimes && movie.showtimes.length > 0
    ? movie.showtimes
    : [
        { time: "09:30 AM" },
        { time: "01:15 PM" },
        { time: "04:30 PM" },
        { time: "07:45 PM" },
        { time: "10:30 PM" },
      ];

  const getPosterSrc = () => {
    if (movie.poster && movie.poster.startsWith("http")) return movie.poster;
    if (movie.fallbackPoster) return movie.fallbackPoster;
    return "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80";
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#f8f3e9] px-4 py-6 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6"
    >
      {/* Back Button to Movie Details */}
      <button
        onClick={() => navigate(`/movie/${movie._id}`)}
        className="flex items-center gap-2 text-[#5b0f1b] hover:text-[#8b1e3f] font-extrabold text-sm transition cursor-pointer"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Movie Details
      </button>

      {/* Header Summary Banner */}
      <div className="bg-[#faf7f2] border border-[#e7dac8] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={getPosterSrc()}
            alt={movie.title}
            onError={(e) => {
              e.target.src = movie.fallbackPoster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80";
            }}
            className="w-16 h-24 object-cover rounded-xl border border-[#e7dac8] shadow-sm shrink-0"
          />

          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="bg-[#5b0f1b] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                {movie.certificate || "UA"}
              </span>
              <span className="bg-[#f5efe6] text-[#8b1e3f] text-xs font-bold px-2.5 py-0.5 rounded-md border border-[#e7dac8]">
                {movie.movieLanguage || movie.language || "Hindi"}
              </span>
              <span className="bg-[#f5efe6] text-[#4b2e1e] text-xs font-bold px-2.5 py-0.5 rounded-md border border-[#e7dac8]">
                {movie.duration} mins
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#5b0f1b]">
              {movie.title}
            </h1>

            <p className="text-xs text-[#4b2e1e] font-medium mt-0.5">
              Step 1 of 2: Select a showtime slot to view available theatres
            </p>
          </div>
        </div>

        <div className="bg-[#f5efe6] border border-[#e7dac8] px-4 py-2 rounded-2xl text-center shrink-0">
          <div className="text-xs text-[#8b1e3f] font-bold">5 Daily Showtime Slots</div>
          <div className="text-xs text-[#4b2e1e] font-semibold">Multiple Venues per Slot</div>
        </div>
      </div>

      {/* Showtime Selection Box */}
      <div className="bg-[#faf7f2] border border-[#e7dac8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-black text-[#5b0f1b] flex items-center gap-2">
            <svg className="w-6 h-6 text-[#8b1e3f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Select Showtime Slot
          </h2>
          <p className="text-xs text-[#4b2e1e] font-medium mt-1">
            Click on your preferred showtime to choose an available theatre venue
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {showtimeSlots.map((slot, idx) => (
            <Motion.button
              key={slot.time || idx}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelectShowtime(slot.time)}
              className="bg-white border-2 border-[#e7dac8] hover:border-[#8b1e3f] p-5 rounded-2xl shadow-sm hover:shadow-md transition text-left space-y-2 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl font-black text-[#5b0f1b] group-hover:text-[#8b1e3f] transition">
                  {slot.time}
                </span>
                <span className="text-xs bg-[#f5efe6] text-[#8b1e3f] font-bold px-3 py-1 rounded-full border border-[#e7dac8]">
                  Available
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium flex items-center justify-between pt-2 border-t border-[#e7dac8]/50">
                <span>{slot.theatres?.length || 10} Theatres Available</span>
                <span className="text-[#8b1e3f] font-bold group-hover:translate-x-1 transition-transform inline-block">
                  Select →
                </span>
              </p>
            </Motion.button>
          ))}
        </div>
      </div>
    </Motion.div>
  );
}

export default ShowsPage;
