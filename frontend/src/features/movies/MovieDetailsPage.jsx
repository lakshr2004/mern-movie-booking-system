import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import API from "../../services/api";
import { AuthContext } from "../auth/AuthContext";

function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  // Check if admin is logged in (user data is nested: user.user.role)
  const isAdmin = user && user.user?.role === "admin";

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await API.get("/movies/" + id);
        setMovie(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleWatchTrailer = () => {
    setShowTrailerModal(true);
  };

  const handleBookTickets = () => {
    navigate("/shows/" + id);
  };

  // Skeleton loader
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f3e9] p-3 sm:p-4 md:p-6">
        <div className="max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="w-full sm:w-1/3">
              <div className="aspect-[2/3] bg-gray-300 animate-pulse rounded-lg sm:rounded-xl" />
            </div>
            <div className="w-full sm:w-2/3 space-y-3 sm:space-y-4">
              <div className="h-8 sm:h-10 bg-gray-300 animate-pulse rounded w-3/4" />
              <div className="h-5 sm:h-6 bg-gray-300 animate-pulse rounded w-1/2" />
              <div className="h-3 sm:h-4 bg-gray-300 animate-pulse rounded w-full" />
              <div className="h-3 sm:h-4 bg-gray-300 animate-pulse rounded w-2/3" />
              <div className="h-20 sm:h-28 md:h-32 bg-gray-300 animate-pulse rounded w-full mt-4 sm:mt-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#f8f3e9] flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-[#6b3e26] mb-4">Movie not found</h2>
          <Link to="/" className="text-[#8b1e3f] hover:underline">Go back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <Motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#f8f3e9] p-2 sm:p-4 md:p-6"
    >
      <div className="max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-1.5 sm:gap-2 text-[#5b0f1b] hover:text-[#8b1e3f] mb-2 sm:mb-4 transition text-sm sm:text-base font-semibold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>

        {/* Rating badge - outside the card */}
        <div className="bg-yellow-500 text-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base font-bold flex items-center gap-1.5 sm:gap-2 w-fit mb-2 sm:mb-4 shadow-lg">
          <span>⭐</span>
          <span>{movie.rating}/10</span>
        </div>

        {/* Full Maroon Card - Responsive */}
        <div className="bg-[#5b0f1b] rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl overflow-hidden">
          <div className="p-3 sm:p-5 md:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 md:gap-8">
              {/* Poster - Smaller for mobile */}
              <div className="w-full sm:w-1/3">
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src={movie.poster} 
                    alt={movie.title}
                    onError={(e) => {
                      e.target.src = "https://picsum.photos/400/600";
                    }}
                    className="w-full aspect-[2/3] object-cover"
                  />
                </div>
              </div>

              {/* Movie Info */}
              <div className="w-full sm:w-2/3">
                <Motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Title - Smaller on mobile */}
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-3 md:mb-4">
                    {movie.title}
                  </h1>

                  {/* Tags - Smaller on mobile */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 mb-2 sm:mb-4 md:mb-6">
                    <span className="bg-[#8b1e3f] text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium">
                      {movie.genre}
                    </span>
                    <span className="bg-[#3d080f] text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium">
                      {movie.movieLanguage || movie.language}
                    </span>
                    <span className="bg-[#3d080f] text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-3.5 sm:w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {movie.duration} min
                    </span>
                  </div>

                  {/* Description - Smaller text on mobile */}
                  <div className="mb-3 sm:mb-6">
                    <h2 className="text-base sm:text-lg md:text-xl font-semibold text-[#f5e6e0] mb-1 sm:mb-2">Description</h2>
                    <p className="text-sm sm:text-base text-[#e8dcd6] leading-relaxed line-clamp-3 sm:line-clamp-none">
                      {movie.description}
                    </p>
                  </div>

                  {/* Cast - Smaller on mobile */}
                  {movie.cast && movie.cast.length > 0 && (
                    <div className="mb-3 sm:mb-6">
                      <h2 className="text-base sm:text-lg md:text-xl font-semibold text-[#f5e6e0] mb-1 sm:mb-2">Cast</h2>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {movie.cast.map((actor, index) => (
                          <span 
                            key={index}
                            className="bg-[#8b1e3f]/50 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium border border-[#a52a4f]"
                          >
                            {actor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

               

                  {/* Action Buttons - Admin sees Edit button, Users see Watch Trailer and Book Tickets */}
                  {isAdmin ? (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-6">
                      <button
                        onClick={() => navigate("/admin?tab=movies")}
                        className="flex items-center justify-center gap-1.5 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit Movie
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-6">
                      <button
                        onClick={handleWatchTrailer}
                        className="flex items-center justify-center gap-1.5 sm:gap-2 bg-[#8b1e3f] hover:bg-[#b02a4f] text-white px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Watch Trailer
                      </button>
                      <button
                        onClick={handleBookTickets}
                        className="flex items-center justify-center gap-1.5 sm:gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                        Book Tickets
                      </button>
                    </div>
                  )}
                </Motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Modal - Responsive */}
      {showTrailerModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#5b0f1b] rounded-2xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full text-center shadow-2xl"
          >
            <div className="mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#8b1e3f] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Coming Soon</h3>
              <p className="text-sm sm:text-base text-[#e8dcd6]">
                This feature is not available right now. Stay tuned for updates!
              </p>
            </div>
            <button
              onClick={() => setShowTrailerModal(false)}
              className="bg-[#8b1e3f] hover:bg-[#b02a4f] text-white px-6 py-2 sm:px-8 sm:py-3 rounded-xl text-sm sm:text-base font-semibold transition"
            >
              Close
            </button>
          </Motion.div>
        </div>
      )}
    </Motion.div>
  );
}

export default MovieDetailsPage;

