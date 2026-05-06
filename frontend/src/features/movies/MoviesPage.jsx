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
      <section className="relative overflow-hidden bg-[#edf1f5]">

        {/* SOFT BACKGROUND */}
        <div className="absolute inset-0">
          <img
            src={currentMovie.poster}
            alt={currentMovie.title}
            className="w-full h-full object-cover blur-3xl opacity-[0.07] scale-125"
          />

          <div className="absolute inset-0 bg-[#edf1f5]/95" />
        </div>

        {/* MOBILE + TABLET ARROWS */}
        <button
          onClick={() =>
            setCurrentSlide((prev) =>
              prev === 0 ? movies.length - 1 : prev - 1
            )
          }
          className="
      absolute
      left-2
      sm:left-4
      top-[48%]
      -translate-y-1/2
      z-30
      bg-white/90
      shadow-xl
      rounded-full
      w-10
      h-10
      sm:w-11
      sm:h-11
      flex
      items-center
      justify-center
      hover:scale-110
      transition-all
      duration-300
    "
        >
          <span className="text-[#5b0f1b] text-xl font-bold">
            ‹
          </span>
        </button>

        <button
          onClick={() =>
            setCurrentSlide((prev) =>
              prev === movies.length - 1 ? 0 : prev + 1
            )
          }
          className="
      absolute
      right-2
      sm:right-4
      top-[48%]
      -translate-y-1/2
      z-30
      bg-white/90
      shadow-xl
      rounded-full
      w-10
      h-10
      sm:w-11
      sm:h-11
      flex
      items-center
      justify-center
      hover:scale-110
      transition-all
      duration-300
    "
        >
          <span className="text-[#5b0f1b] text-xl font-bold">
            ›
          </span>
        </button>

        <div className="relative z-10 max-w-7xl mx-auto px-4">

          {/* MOBILE */}
          <div className="flex flex-col lg:hidden items-center text-center pt-6 pb-8">

            {/* CONTENT */}
            <Motion.div
              key={currentMovie._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center"
            >
              <p className="text-[#8b1e3f] font-bold tracking-[0.35em] uppercase text-[11px] mb-2">
                Featured Movie
              </p>

              <h1 className="text-[2rem] sm:text-5xl font-black text-[#222] leading-tight mb-3">
                {currentMovie.title}
              </h1>

              {/* TAGS */}
              <div className="flex flex-wrap justify-center gap-2 max-w-sm mb-4">
                <span className="bg-[#8b1e3f] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  {currentMovie.genre}
                </span>

                <span className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  ⭐ {currentMovie.rating}/10
                </span>

                <span className="bg-white text-[#333] px-4 py-2 rounded-full text-sm font-medium shadow-md">
                  ⏱ {currentMovie.duration} mins
                </span>

                <span className="bg-white text-[#333] px-4 py-2 rounded-full text-sm font-medium shadow-md">
                  🌐 {currentMovie.movieLanguage}
                </span>
              </div>

              <p className="text-gray-600 text-sm max-w-xs sm:max-w-md leading-relaxed mb-4 line-clamp-2">
                {currentMovie.description}
              </p>

              <Link to={`/movie/${currentMovie._id}`}>
                <button
                  className="
              bg-[#8b1e3f]
              hover:bg-[#6d102c]
              text-white
              px-8
              py-3
              rounded-2xl
              font-bold
              shadow-xl
              transition-all
              duration-300
              hover:scale-105
              mb-4
            "
                >
                  {isAdmin ? "Edit Movie" : "Book Tickets"}
                </button>
              </Link>

              {/* DOTS */}
              <div className="flex items-center justify-center gap-2 mb-5">
                {movies.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`
                rounded-full
                transition-all
                duration-300
                ${currentSlide === index
                        ? "w-6 h-2 bg-[#8b1e3f]"
                        : "w-2 h-2 bg-gray-400"
                      }
              `}
                  />
                ))}
              </div>
            </Motion.div>

            {/* POSTER */}
            <Motion.div
              key={currentMovie.poster}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex justify-center"
            >
              <img
                src={currentMovie.poster}
                alt={currentMovie.title}
                className="
            w-36
            sm:w-44
            md:w-52
            aspect-[2/3]
            object-cover
            rounded-[2rem]
            shadow-2xl
            border
            border-white/60
          "
              />
            </Motion.div>
          </div>

          {/* LAPTOP + TABLET */}
          <div className="hidden lg:grid lg:grid-cols-2 items-center gap-6 xl:gap-12 py-14">

            {/* POSTER */}
            <Motion.div
              key={currentMovie.poster}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex justify-center"
            >
              <img
                src={currentMovie.poster}
                alt={currentMovie.title}
                className="
            w-60
            xl:w-72
            aspect-[2/3]
            object-cover
            rounded-[2rem]
            shadow-2xl
            border
            border-white/60
          "
              />
            </Motion.div>

            {/* CONTENT */}
            <Motion.div
              key={currentMovie._id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-xl"
            >
              <p className="text-[#8b1e3f] font-bold tracking-[0.35em] uppercase text-xs mb-3">
                Featured Movie
              </p>

              <h1 className="text-5xl xl:text-6xl font-black text-[#222] leading-tight mb-5">
                {currentMovie.title}
              </h1>

              <div className="flex flex-wrap gap-3 mb-5">
                <span className="bg-[#8b1e3f] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  {currentMovie.genre}
                </span>

                <span className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  ⭐ {currentMovie.rating}/10
                </span>

                <span className="bg-white text-[#333] px-4 py-2 rounded-full text-sm font-medium shadow-md">
                  ⏱ {currentMovie.duration} mins
                </span>

                <span className="bg-white text-[#333] px-4 py-2 rounded-full text-sm font-medium shadow-md">
                  🌐 {currentMovie.movieLanguage}
                </span>
              </div>

              <p className="text-gray-600 text-lg leading-relaxed mb-7 line-clamp-3">
                {currentMovie.description}
              </p>

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
              shadow-xl
              transition-all
              duration-300
              hover:scale-105
            "
                >
                  {isAdmin ? "Edit Movie" : "Book Tickets"}
                </button>
              </Link>

              {/* DOTS */}
              <div className="flex items-center gap-2 mt-8">
                {movies.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`
                rounded-full
                transition-all
                duration-300
                ${currentSlide === index
                        ? "w-8 h-2 bg-[#8b1e3f]"
                        : "w-2 h-2 bg-gray-400"
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
      <section className="max-w-[1400px] mx-auto px-3 sm:px-4 pb-14">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-4xl font-black text-[#5b0f1b]">
            All Movies
          </h2>

          <span className="text-gray-500 text-sm font-medium">
            {filteredMovies.length} Movies
          </span>
        </div>

        <div
          className="
      flex
      gap-3
      sm:gap-4
      overflow-x-auto
      scrollbar-hide
      pb-3
      snap-x
      snap-mandatory
    "
        >
          {filteredMovies.map((movie) => (
            <Link
              key={movie._id}
              to={`/movie/${movie._id}`}
              className="snap-start flex-shrink-0"
            >
              <Motion.div
                whileHover={{ y: -6 }}
                className="
            w-[135px]
            sm:w-[155px]
            md:w-[170px]
            lg:w-[190px]
            bg-white
            rounded-2xl
            overflow-hidden
            shadow-md
            hover:shadow-xl
            transition-all
            duration-300
          "
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="
              w-full
              h-[190px]
              sm:h-[220px]
              md:h-[240px]
              lg:h-[270px]
              object-cover
            "
                />

                <div className="p-3">
                  <h3 className="font-bold text-[#3d080f] truncate text-sm sm:text-base">
                    {movie.title}
                  </h3>

                  <div className="flex justify-between items-center mt-2">
                    <span className="text-yellow-600 font-bold text-xs sm:text-sm">
                      ⭐ {movie.rating}
                    </span>

                    <span className="text-gray-500 text-xs truncate max-w-[60px]">
                      {movie.movieLanguage}
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
      <section className="max-w-[1400px] mx-auto px-3 sm:px-4 py-10">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-4xl font-black text-[#5b0f1b]">
            Top Rated
          </h2>
        </div>

        <div
          className="
      flex
      gap-3
      sm:gap-4
      overflow-x-auto
      scrollbar-hide
      pb-3
      snap-x
      snap-mandatory
    "
        >
          {topRatedMovies.map((movie) => (
            <Link
              key={movie._id}
              to={`/movie/${movie._id}`}
              className="snap-start flex-shrink-0"
            >
              <Motion.div
                whileHover={{ y: -6 }}
                className="
            w-[135px]
            sm:w-[155px]
            md:w-[170px]
            lg:w-[190px]
            bg-white
            rounded-2xl
            overflow-hidden
            shadow-md
            hover:shadow-xl
            transition-all
            duration-300
          "
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="
              w-full
              h-[190px]
              sm:h-[220px]
              md:h-[240px]
              lg:h-[270px]
              object-cover
            "
                />

                <div className="p-3">
                  <h3 className="font-bold text-[#3d080f] truncate text-sm sm:text-base">
                    {movie.title}
                  </h3>

                  <p className="text-yellow-600 font-bold mt-2 text-xs sm:text-sm">
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
      <section className="max-w-[1400px] mx-auto px-3 sm:px-4 py-10 pb-20">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-4xl font-black text-[#5b0f1b]">
            All Theatres
          </h2>
        </div>

        <div
          className="
      flex
      gap-3
      sm:gap-4
      overflow-x-auto
      scrollbar-hide
      pb-3
      snap-x
      snap-mandatory
    "
        >
          {theatres.map((theatre, index) => (
            <Motion.div
              key={theatre._id || index}
              whileHover={{ y: -5 }}
              className="
          snap-start
          flex-shrink-0
          w-[220px]
          sm:w-[240px]
          md:w-[260px]
          bg-white
          rounded-2xl
          p-4
          shadow-md
          hover:shadow-xl
          transition-all
          duration-300
        "
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-[#fce7ef] flex items-center justify-center text-2xl">
                  🎭
                </div>

                <div>
                  <h3 className="font-bold text-[#3d080f] text-base sm:text-lg line-clamp-1">
                    {theatre.name || theatre.theatreName}
                  </h3>

                  <p className="text-gray-500 text-sm">
                    📍 {theatre.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Seats: {theatre.totalSeats || 100}
                </span>

                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                  Available
                </span>
              </div>
            </Motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default MoviesPage;