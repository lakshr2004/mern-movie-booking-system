import { useEffect, useState, useContext, useMemo } from "react";
import API from "../../services/api";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { AuthContext } from "../auth/AuthContext";

function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");

  const { user } = useContext(AuthContext);

  const isAdmin = user?.user?.role === "admin";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, theatresRes] = await Promise.all([
          API.get("/movies"),
          API.get("/theatres"),
        ]);

        const rawMovies =
          moviesRes.data?.movies ||
          moviesRes.data?.data ||
          moviesRes.data ||
          [];

        const moviesData = Array.isArray(rawMovies)
          ? rawMovies.map((m, index) => ({
              ...m,
              _id: m._id || m.id || index.toString(),
              title: m.title || "Untitled",
              poster:
                m.poster ||
                "https://via.placeholder.com/400x600?text=Movie",
              movieLanguage: m.movieLanguage || m.language || "N/A",
              genre: m.genre || "Movie",
              duration: m.duration || 120,
              rating: Number(m.rating || 0),
              description:
                m.description ||
                "Experience the ultimate cinematic journey with this amazing movie.",
            }))
          : [];

        const rawTheatres =
          theatresRes.data?.theatres ||
          theatresRes.data?.data ||
          theatresRes.data ||
          [];

        setMovies(moviesData);
        setTheatres(Array.isArray(rawTheatres) ? rawTheatres : []);
      } catch (error) {
        console.log("API ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // HERO AUTO SLIDE
  useEffect(() => {
    if (!movies.length) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === movies.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [movies]);

  // FILTERED MOVIES
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const matchesSearch = movie.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesGenre =
        selectedGenre === "All" ||
        movie.genre?.toLowerCase() === selectedGenre.toLowerCase();

      const matchesLanguage =
        selectedLanguage === "All" ||
        movie.movieLanguage?.toLowerCase() ===
          selectedLanguage.toLowerCase();

      return matchesSearch && matchesGenre && matchesLanguage;
    });
  }, [movies, searchQuery, selectedGenre, selectedLanguage]);

  // TOP RATED
  const topRatedMovies = [...movies]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  // UNIQUE VALUES
  const genres = [
    "All",
    ...new Set(movies.map((m) => m.genre).filter(Boolean)),
  ];

  const languages = [
    "All",
    ...new Set(movies.map((m) => m.movieLanguage).filter(Boolean)),
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f3e9]">
        <div className="text-2xl font-bold text-[#5b0f1b] animate-pulse">
          Loading Movies...
        </div>
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f3e9]">
        <div className="text-xl font-semibold text-[#5b0f1b]">
          ❌ No movies found. Add movies from admin panel.
        </div>
      </div>
    );
  }

  const currentMovie = movies[currentSlide];

  return (
    <div className="bg-[#f8f3e9] min-h-screen overflow-hidden">
      {/* HERO SECTION */}
{/* HERO SECTION */}
<section className="relative overflow-hidden bg-[#eceff1]">
  {/* SOFT BACKGROUND */}
  <div className="absolute inset-0">
    <img
      src={currentMovie.poster}
      alt={currentMovie.title}
      className="w-full h-full object-cover blur-3xl opacity-10 scale-125"
    />

    <div className="absolute inset-0 bg-gradient-to-r from-[#eceff1]/95 via-[#eceff1]/90 to-[#f5f7fa]/95" />
  </div>

  {/* ARROWS */}
  <button
    onClick={() =>
      setCurrentSlide((prev) =>
        prev === 0 ? movies.length - 1 : prev - 1
      )
    }
    className="
      absolute
      left-3
      sm:left-5
      top-1/2
      -translate-y-1/2
      z-30
      bg-white/80
      backdrop-blur-md
      hover:bg-white
      shadow-xl
      rounded-full
      w-11
      h-11
      sm:w-14
      sm:h-14
      flex
      items-center
      justify-center
      transition-all
      duration-300
      hover:scale-110
    "
  >
    <span className="text-2xl font-bold text-[#5b0f1b]">‹</span>
  </button>

  <button
    onClick={() =>
      setCurrentSlide((prev) =>
        prev === movies.length - 1 ? 0 : prev + 1
      )
    }
    className="
      absolute
      right-3
      sm:right-5
      top-1/2
      -translate-y-1/2
      z-30
      bg-white/80
      backdrop-blur-md
      hover:bg-white
      shadow-xl
      rounded-full
      w-11
      h-11
      sm:w-14
      sm:h-14
      flex
      items-center
      justify-center
      transition-all
      duration-300
      hover:scale-110
    "
  >
    <span className="text-2xl font-bold text-[#5b0f1b]">›</span>
  </button>

  {/* CONTENT */}
  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      
      {/* POSTER LEFT */}
      <Motion.div
        key={currentMovie.poster}
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center lg:justify-start"
      >
        <div className="relative group">
          {/* GLOW */}
          <div className="absolute -inset-2 bg-gradient-to-r from-[#8b1e3f]/20 to-yellow-400/20 blur-2xl rounded-[2rem]" />

          <img
            src={currentMovie.poster}
            alt={currentMovie.title}
            className="
              relative
              w-52
              sm:w-64
              md:w-72
              lg:w-80
              xl:w-[340px]
              aspect-[2/3]
              object-cover
              rounded-[2rem]
              shadow-2xl
              border
              border-white/60
              backdrop-blur-md
              transition-all
              duration-500
              group-hover:scale-[1.02]
            "
          />
        </div>
      </Motion.div>

      {/* RIGHT CONTENT */}
      <Motion.div
        key={currentMovie._id}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-[#8b1e3f] font-bold tracking-[0.3em] uppercase mb-3 text-xs sm:text-sm">
          Featured Movie
        </p>

        <h1
          className="
            text-3xl
            sm:text-5xl
            lg:text-6xl
            xl:text-7xl
            font-black
            text-[#2d2d2d]
            leading-tight
            mb-5
          "
        >
          {currentMovie.title}
        </h1>

        {/* TAGS */}
        <div className="flex flex-wrap gap-3 mb-6">
          <span className="bg-[#8b1e3f] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
            {currentMovie.genre}
          </span>

          <span className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg">
            ⭐ {currentMovie.rating}/10
          </span>

          <span className="bg-white text-[#333] px-4 py-2 rounded-full text-sm font-medium shadow-lg border border-gray-200">
            ⏱ {currentMovie.duration} mins
          </span>

          <span className="bg-white text-[#333] px-4 py-2 rounded-full text-sm font-medium shadow-lg border border-gray-200">
            🌐 {currentMovie.movieLanguage}
          </span>
        </div>

        {/* DESCRIPTION */}
        <p
          className="
            text-gray-600
            text-sm
            sm:text-base
            lg:text-lg
            leading-relaxed
            max-w-2xl
            mb-8
            line-clamp-4
          "
        >
          {currentMovie.description}
        </p>

        {/* BUTTONS */}
        <div className="flex flex-wrap gap-4">
          <Link to={`/movie/${currentMovie._id}`}>
            <button
              className="
                bg-[#8b1e3f]
                hover:bg-[#6d102c]
                text-white
                px-8
                py-3.5
                rounded-2xl
                font-bold
                shadow-2xl
                hover:scale-105
                transition-all
                duration-300
              "
            >
              {isAdmin ? "Edit Movie" : "Book Tickets"}
            </button>
          </Link>

          <button
            className="
              bg-white/80
              backdrop-blur-md
              border
              border-gray-200
              hover:bg-white
              text-[#333]
              px-8
              py-3.5
              rounded-2xl
              font-bold
              shadow-lg
              transition-all
              duration-300
            "
          >
            ▶ Watch Trailer
          </button>
        </div>

        {/* SLIDER DOTS */}
        <div className="flex items-center gap-3 mt-10">
          {movies.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`
                transition-all duration-300 rounded-full
                ${
                  currentSlide === index
                    ? "w-10 h-3 bg-[#8b1e3f]"
                    : "w-3 h-3 bg-gray-400 hover:bg-gray-500"
                }
              `}
            />
          ))}
        </div>
      </Motion.div>
    </div>
  </div>
</section>

      {/* SEARCH + FILTER */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border border-white">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#8b1e3f]"
          />

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#8b1e3f]"
          >
            {genres.map((genre, i) => (
              <option key={i}>{genre}</option>
            ))}
          </select>

          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#8b1e3f]"
          >
            {languages.map((lang, i) => (
              <option key={i}>{lang}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedGenre("All");
              setSelectedLanguage("All");
            }}
            className="bg-[#8b1e3f] hover:bg-[#6d102c] text-white rounded-2xl px-4 py-3 font-semibold transition-all duration-300 shadow-lg"
          >
            Reset Filters
          </button>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#8b1e3f]/40 to-transparent" />
      </div>

      {/* ALL MOVIES */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-[#5b0f1b]">
            All Movies
          </h2>

          <span className="text-gray-500 font-medium text-sm sm:text-base">
            {filteredMovies.length} Movies Available
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredMovies.map((movie) => (
            <Link key={movie._id} to={`/movie/${movie._id}`}>
              <Motion.div
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
                className="
                  bg-white/90
                  backdrop-blur-sm
                  rounded-3xl
                  overflow-hidden
                  shadow-lg
                  hover:shadow-2xl
                  transition-all
                  duration-300
                  border
                  border-white
                  h-full
                "
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="
                    h-[240px]
                    sm:h-[280px]
                    md:h-[320px]
                    w-full
                    object-cover
                  "
                />

                <div className="p-4">
                  <h3 className="font-bold text-base sm:text-lg truncate text-[#3d080f]">
                    {movie.title}
                  </h3>

                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="text-gray-500 truncate">
                      {movie.movieLanguage}
                    </span>

                    <span className="font-semibold text-yellow-600">
                      ⭐ {movie.rating}
                    </span>
                  </div>

                  <div className="mt-3">
                    <span className="bg-[#fce7ef] text-[#8b1e3f] px-3 py-1 rounded-full text-xs font-semibold">
                      {movie.genre}
                    </span>
                  </div>
                </div>
              </Motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* DIVIDER */}
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#8b1e3f]/40 to-transparent" />
      </div>

      {/* TOP RATED */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-[#5b0f1b]">
            Top Rated Movies
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {topRatedMovies.map((movie) => (
            <Link key={movie._id} to={`/movie/${movie._id}`}>
              <Motion.div
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.3 }}
                className="
                  bg-white/90
                  backdrop-blur-sm
                  rounded-3xl
                  overflow-hidden
                  shadow-lg
                  hover:shadow-2xl
                  transition-all
                  duration-300
                  border
                  border-white
                "
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="
                    h-[220px]
                    sm:h-[260px]
                    md:h-[300px]
                    w-full
                    object-cover
                  "
                />

                <div className="p-4">
                  <h3 className="font-bold truncate text-[#3d080f]">
                    {movie.title}
                  </h3>

                  <p className="text-yellow-600 font-bold mt-2">
                    ⭐ {movie.rating}/10
                  </p>
                </div>
              </Motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* DIVIDER */}
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#8b1e3f]/40 to-transparent" />
      </div>

      {/* THEATRES */}
      <section className="max-w-7xl mx-auto px-4 py-10 pb-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-[#5b0f1b]">
            All Theatres
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {theatres.map((theatre, index) => (
            <Motion.div
              key={theatre._id || index}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="
                bg-white/90
                backdrop-blur-sm
                rounded-3xl
                p-6
                shadow-lg
                hover:shadow-2xl
                transition-all
                duration-300
                border
                border-white
              "
            >
              <div className="flex items-start gap-4">
                <div className="bg-[#fce7ef] text-[#8b1e3f] p-4 rounded-2xl text-3xl shadow">
                  🎭
                </div>

                <div className="flex-1">
                  <h3 className="font-black text-xl text-[#3d080f]">
                    {theatre.name || theatre.theatreName}
                  </h3>

                  <p className="text-gray-500 mt-1">
                    📍 {theatre.location}
                  </p>

                  <div className="flex justify-between items-center mt-5">
                    <span className="text-sm text-gray-600">
                      Seats:{" "}
                      <strong>
                        {theatre.totalSeats || 100}
                      </strong>
                    </span>

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                      Available
                    </span>
                  </div>
                </div>
              </div>
            </Motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default MoviesPage;