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

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f3e9] p-3 sm:p-4 md:p-6">
        <div className="max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="w-full sm:w-1/3">
              <div className="aspect-[2/3] bg-gray-300 animate-pulse rounded-2xl" />
            </div>

            <div className="w-full sm:w-2/3 space-y-4">
              <div className="h-10 bg-gray-300 animate-pulse rounded-xl w-3/4" />
              <div className="h-6 bg-gray-300 animate-pulse rounded-xl w-1/2" />
              <div className="h-4 bg-gray-300 animate-pulse rounded-xl w-full" />
              <div className="h-4 bg-gray-300 animate-pulse rounded-xl w-2/3" />
              <div className="h-28 bg-gray-300 animate-pulse rounded-xl w-full mt-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // NOT FOUND
  if (!movie) {
    return (
      <div className="min-h-screen bg-[#f8f3e9] flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#6b3e26] mb-4">
            Movie not found
          </h2>

          <Link to="/" className="text-[#8b1e3f] hover:underline">
            Go back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#f8f3e9] px-3 py-4 sm:px-5 md:px-8"
    >
      <div className="max-w-5xl mx-auto">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#5b0f1b] hover:text-[#8b1e3f] mb-4 transition font-semibold"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>

          Back
        </button>

        {/* RATING */}
        <div className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm sm:text-base font-bold flex items-center gap-2 w-fit mb-4 shadow-lg">
          ⭐ {movie.rating}/10
        </div>

        {/* MAIN CARD */}
        <div className="bg-[#5b0f1b] rounded-[28px] shadow-2xl overflow-hidden">

          <div className="p-4 sm:p-6 md:p-8">

            <div className="flex flex-col sm:flex-row gap-5 sm:gap-7 md:gap-10">

              {/* POSTER */}
              <div className="w-full sm:w-1/3 flex justify-center sm:justify-start">

                <div
                  className="
                    relative
                    rounded-2xl
                    overflow-hidden
                    shadow-2xl

                    w-[60%]
                    max-w-[170px]

                    sm:w-full
                    sm:max-w-none
                  "
                >
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

              {/* CONTENT */}
              <div className="w-full sm:w-2/3">

                <Motion.div
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >

                  {/* TITLE */}
                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-4 text-center sm:text-left">
                    {movie.title}
                  </h1>

                  {/* TAGS */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3 mb-5">

                    <span className="bg-[#8b1e3f] text-white px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow">
                      {movie.genre}
                    </span>

                    <span className="bg-[#3d080f] text-white px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow">
                      🌐 {movie.movieLanguage || movie.language}
                    </span>

                    <span className="bg-[#3d080f] text-white px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow">
                      ⏱ {movie.duration} mins
                    </span>

                  </div>

                  {/* DESCRIPTION */}
                  <div className="mb-6 text-center sm:text-left">

                    <h2 className="text-lg sm:text-xl font-bold text-[#f5e6e0] mb-2">
                      Description
                    </h2>

                    <p className="text-[#e8dcd6] text-sm sm:text-base leading-relaxed">
                      {movie.description}
                    </p>

                  </div>

                  {/* CAST */}
                  {movie.cast && movie.cast.length > 0 && (

                    <div className="mb-6 text-center sm:text-left">

                      <h2 className="text-lg sm:text-xl font-bold text-[#f5e6e0] mb-3">
                        Cast
                      </h2>

                      <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                        {movie.cast.map((actor, index) => (
                          <span
                            key={index}
                            className="bg-[#8b1e3f]/60 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border border-[#a52a4f]"
                          >
                            {actor}
                          </span>
                        ))}
                      </div>

                    </div>
                  )}

                  {/* BUTTONS */}
                  {isAdmin ? (

                    <div className="flex justify-center sm:justify-start">

                      <button
                        onClick={() => navigate("/admin?tab=movies")}
                        className="
                          flex
                          items-center
                          justify-center
                          gap-2
                          bg-blue-600
                          hover:bg-blue-700
                          text-white
                          px-6
                          py-3
                          rounded-xl
                          text-sm
                          sm:text-base
                          font-bold
                          shadow-lg
                          hover:scale-105
                          transition-all
                        "
                      >
                        ✏ Edit Movie
                      </button>

                    </div>

                  ) : (

                    <div className="flex flex-col sm:flex-row gap-3 mt-6">

                      <button
                        onClick={handleWatchTrailer}
                        className="
                          flex-1
                          flex
                          items-center
                          justify-center
                          gap-2
                          bg-[#8b1e3f]
                          hover:bg-[#b02a4f]
                          text-white
                          px-6
                          py-3
                          rounded-xl
                          text-sm
                          sm:text-base
                          font-bold
                          shadow-lg
                          transition-all
                        "
                      >
                        ▶ Watch Trailer
                      </button>

                      <button
                        onClick={handleBookTickets}
                        className="
                          flex-1
                          flex
                          items-center
                          justify-center
                          gap-2
                          bg-yellow-400
                          hover:bg-yellow-300
                          text-black
                          px-6
                          py-3
                          rounded-xl
                          text-sm
                          sm:text-base
                          font-bold
                          shadow-lg
                          transition-all
                        "
                      >
                        🎟 Book Tickets
                      </button>

                    </div>

                  )}

                </Motion.div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TRAILER MODAL */}
      {showTrailerModal && (

        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">

          <Motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="
              bg-[#5b0f1b]
              rounded-3xl
              p-6
              sm:p-8
              max-w-md
              w-full
              text-center
              shadow-2xl
            "
          >

            <div className="mb-5">

              <div className="w-20 h-20 bg-[#8b1e3f] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-white">🎬</span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                Coming Soon
              </h3>

              <p className="text-[#e8dcd6]">
                Trailer feature will be available soon.
              </p>

            </div>

            <button
              onClick={() => setShowTrailerModal(false)}
              className="
                bg-[#8b1e3f]
                hover:bg-[#b02a4f]
                text-white
                px-8
                py-3
                rounded-xl
                font-bold
                transition-all
              "
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