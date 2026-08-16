import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import API from "../../services/api";

function TheatreListPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedTime = searchParams.get("time");

  const [movie, setMovie] = useState(null);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [movieId, selectedTime]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [movieRes, showsRes] = await Promise.allSettled([
          API.get("/movies/" + movieId),
          API.get("/shows/movie/" + movieId),
        ]);

        const movieData = movieRes.status === "fulfilled" ? movieRes.value.data : null;
        const showsData = showsRes.status === "fulfilled" ? showsRes.value.data : [];

        setMovie(movieData);

        let availableTheatres = [];

        // 1. Try extracting from movie.showtimes for selectedTime
        if (movieData && movieData.showtimes && movieData.showtimes.length > 0) {
          const matchedSlot = movieData.showtimes.find((s) => s.time === selectedTime) || movieData.showtimes[0];
          if (matchedSlot && matchedSlot.theatres) {
            availableTheatres = matchedSlot.theatres.map((t) => {
              const matchedShow = Array.isArray(showsData) ? showsData.find(s => s._id === (t.showId || t._id)) : null;
              const bookedCount = matchedShow && matchedShow.bookedSeats ? matchedShow.bookedSeats.length : 0;
              return {
                ...t,
                _id: t.showId || t.theatreId || t._id,
                showId: t.showId || t._id,
                name: t.name || t.theatreName || "Theatre Venue",
                location: t.location || "City Centre",
                price: t.price || 250,
                totalSeats: 100,
                bookedSeatsCount: bookedCount,
              };
            });
          }
        }

        // 2. If no theatres from movie.showtimes, match from Shows collection
        if (availableTheatres.length === 0 && Array.isArray(showsData) && showsData.length > 0) {
          availableTheatres = showsData
            .filter((show) => show && show.theatre)
            .filter((show) => {
              if (!selectedTime) return true;
              if (show.showTime && show.showTime.includes(selectedTime)) return true;
              try {
                const d = new Date(show.showTime);
                const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return timeStr === selectedTime;
              } catch {
                return true;
              }
            })
            .map((show) => ({
              _id: show._id,
              showId: show._id,
              name: show.theatre.name || "Theatre",
              location: show.theatre.location || "City Centre",
              price: show.price || 200,
              totalSeats: show.theatre.totalSeats || show.totalSeats || 100,
              bookedSeatsCount: show.bookedSeats?.length || 0,
            }));
        }

        setTheatres(availableTheatres);
      } catch (error) {
        console.error("Error fetching theatres for showtime:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movieId, selectedTime]);

  const getPosterSrc = () => {
    if (!movie) return "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80";
    if (movie.poster && movie.poster.startsWith("http")) return movie.poster;
    if (movie.fallbackPoster) return movie.fallbackPoster;
    return "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f3e9] px-4 py-8 max-w-5xl mx-auto space-y-6">
        <div className="h-28 bg-[#e7dac8]/50 animate-pulse rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 bg-[#e7dac8]/50 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#f8f3e9] px-4 py-6 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6"
    >
      {/* Back Button to Select Showtime Page */}
      <button
        onClick={() => navigate(`/shows/${movieId}`)}
        className="flex items-center gap-2 text-[#5b0f1b] hover:text-[#8b1e3f] font-extrabold text-sm transition cursor-pointer"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Showtime Selection
      </button>

      {/* Header Banner */}
      {movie && (
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
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#5b0f1b]">
                {movie.title}
              </h1>

              <p className="text-xs text-[#4b2e1e] font-medium mt-0.5">
                Step 2 of 2: Select an available theatre venue for your showtime
              </p>
            </div>
          </div>

          <div className="bg-[#8b1e3f] text-white px-5 py-3 rounded-2xl text-center shrink-0 shadow-md">
            <div className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
              Selected Showtime
            </div>
            <div className="text-xl font-black">{selectedTime || "04:30 PM"}</div>
          </div>
        </div>
      )}

      {/* Theatres List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-[#5b0f1b] flex items-center gap-2">
            <svg className="w-5 h-5 text-[#8b1e3f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Available Theatres ({theatres.length})
          </h2>
          <span className="text-xs font-bold text-[#8b1e3f]">
            Filtered for {selectedTime || "Selected Time"}
          </span>
        </div>

        {theatres.length === 0 ? (
          <div className="bg-[#faf7f2] border border-[#e7dac8] rounded-2xl p-8 text-center text-[#4b2e1e] font-medium">
            No theatres available for this showtime slot.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {theatres.map((t, idx) => {
              const availableSeats = (t.totalSeats || 100) - (t.bookedSeatsCount || 0);
              return (
                <Motion.div
                  key={t.showId || t._id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                  onClick={() => navigate(`/seat/${t.showId || t._id}`)}
                  className="bg-[#faf7f2] border-2 border-[#e7dac8] hover:border-[#8b1e3f] rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between cursor-pointer group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-extrabold text-[#5b0f1b] text-base group-hover:text-[#8b1e3f] transition">
                          {t.name}
                        </h3>
                        <p className="text-xs text-[#4b2e1e] flex items-center gap-1 mt-0.5">
                          <span>📍</span> {t.location}
                        </p>
                      </div>
                      <span className="bg-[#f5efe6] text-[#8b1e3f] border border-[#e7dac8] text-[11px] font-bold px-2.5 py-1 rounded-md shrink-0">
                        {t.screenType || "IMAX 4K"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-[#e7dac8]/60 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-[#4b2e1e] font-medium">
                        Ticket Price: <span className="font-extrabold text-[#8b1e3f]">₹{t.price || 250}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                        {availableSeats} seats available
                      </div>
                    </div>

                    <button className="bg-[#8b1e3f] group-hover:bg-[#5b0f1b] text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1">
                      <span>Select Seats</span>
                      <span>→</span>
                    </button>
                  </div>
                </Motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Motion.div>
  );
}

export default TheatreListPage;
