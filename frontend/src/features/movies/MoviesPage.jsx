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

  // UNIQUE FILTER VALUES
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
      <div className="min-h-screen flex items-center justify-center text-2xl font-bold">
        Loading...
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        ❌ No movies found. Add movies from admin panel.
      </div>
    );
  }

  const currentMovie = movies[currentSlide];

  return (
    <div className="bg-[#f8f3e9] min-h-screen">
      {/* HERO SECTION */}
      <section className="relative h-[85vh] overflow-hidden">
        <img
          src={currentMovie.poster}
          alt={currentMovie.title}
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
        />

        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 h-full flex items-center px-6 md:px-20">
          <div className="grid md:grid-cols-2 gap-10 items-center w-full">
            {/* LEFT */}
            <Motion.div
              key={currentMovie._id}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                {currentMovie.title}
              </h1>

              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-red-700 text-white px-4 py-2 rounded-full">
                  {currentMovie.genre}
                </span>

                <span className="bg-yellow-500 text-black px-4 py-2 rounded-full font-semibold">
                  ⭐ {currentMovie.rating}/10
                </span>

                <span className="bg-gray-800 text-white px-4 py-2 rounded-full">
                  {currentMovie.duration} mins
                </span>

                <span className="bg-gray-800 text-white px-4 py-2 rounded-full">
                  {currentMovie.movieLanguage}
                </span>
              </div>

              <p className="text-gray-300 text-lg max-w-2xl mb-8 line-clamp-3">
                {currentMovie.description}
              </p>

              <Link to={`/movie/${currentMovie._id}`}>
                <button className="bg-red-600 hover:bg-red-700 transition px-8 py-4 rounded-xl text-white text-lg font-bold shadow-lg">
                  {isAdmin ? "Edit Movie" : "Book Tickets"}
                </button>
              </Link>
            </Motion.div>

            {/* RIGHT */}
            <Motion.div
              key={currentMovie.poster}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="hidden md:flex justify-center"
            >
              <img
                src={currentMovie.poster}
                alt={currentMovie.title}
                className="h-[550px] rounded-3xl shadow-2xl object-cover"
              />
            </Motion.div>
          </div>
        </div>
      </section>

      {/* SEARCH + FILTER */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-lg p-6 grid md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search movie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
          />

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="border rounded-xl px-4 py-3 outline-none"
          >
            {genres.map((genre, i) => (
              <option key={i}>{genre}</option>
            ))}
          </select>

          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="border rounded-xl px-4 py-3 outline-none"
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
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-3 font-semibold"
          >
            Reset Filters
          </button>
        </div>
      </section>

      {/* ALL MOVIES */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold text-[#5b0f1b]">
            All Movies
          </h2>

          <span className="text-gray-500 font-medium">
            {filteredMovies.length} Movies
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => (
            <Link key={movie._id} to={`/movie/${movie._id}`}>
              <Motion.div
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition"
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="h-72 w-full object-cover"
                />

                <div className="p-4">
                  <h3 className="font-bold text-lg truncate">
                    {movie.title}
                  </h3>

                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>{movie.movieLanguage}</span>
                    <span>⭐ {movie.rating}</span>
                  </div>

                  <p className="mt-2 text-xs bg-red-100 text-red-700 inline-block px-2 py-1 rounded-full">
                    {movie.genre}
                  </p>
                </div>
              </Motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* TOP RATED */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-white mb-10">
            Top Rated Movies
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {topRatedMovies.map((movie) => (
              <Link key={movie._id} to={`/movie/${movie._id}`}>
                <Motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg"
                >
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="h-64 w-full object-cover"
                  />

                  <div className="p-3">
                    <h3 className="font-bold truncate">
                      {movie.title}
                    </h3>

                    <p className="text-yellow-600 font-semibold">
                      ⭐ {movie.rating}/10
                    </p>
                  </div>
                </Motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* THEATRES */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-[#5b0f1b] mb-10">
          All Theatres
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {theatres.map((theatre, index) => (
            <Motion.div
              key={theatre._id || index}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-red-100 text-red-700 p-4 rounded-xl text-2xl">
                  🎭
                </div>

                <div>
                  <h3 className="font-bold text-xl">
                    {theatre.name || theatre.theatreName}
                  </h3>

                  <p className="text-gray-500">
                    {theatre.location}
                  </p>
                </div>
              </div>

              <div className="flex justify-between text-sm text-gray-600 mt-4">
                <span>
                  Seats:{" "}
                  <strong>{theatre.totalSeats || 100}</strong>
                </span>

                <span className="text-green-600 font-semibold">
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