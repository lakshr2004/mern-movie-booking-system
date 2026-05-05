import { useEffect, useState, useContext } from "react";
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
  const [searchType, setSearchType] = useState("name");
  const { user } = useContext(AuthContext);
  const isAdmin = user?.user?.role === "admin";

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, theatresRes] = await Promise.all([
          API.get("/movies"),
          API.get("/theatres"),
        ]);

        // ✅ HANDLE ALL BACKEND FORMATS SAFELY
        const rawMovies =
          moviesRes.data?.movies ||
          moviesRes.data?.data ||
          moviesRes.data ||
          [];

        const moviesData = Array.isArray(rawMovies) && rawMovies.length > 0
          ? rawMovies.map((m, index) => ({
              ...m,
              _id: m._id || m.id || index.toString(),
              title: m.title || m.name || "Untitled",
              poster:
                m.poster ||
                m.image ||
                "https://via.placeholder.com/300x450?text=Movie",
              movieLanguage: m.movieLanguage || m.language || "N/A",
              rating: m.rating || m.imdbRating || 0,
              genre: m.genre || "Movie",
            }))
          : [];

        const rawTheatres =
          theatresRes.data?.theatres ||
          theatresRes.data?.data ||
          theatresRes.data ||
          [];

        const theatresData = Array.isArray(rawTheatres)
          ? rawTheatres
          : [];

        console.log("FINAL MOVIES:", moviesData);

        setMovies(moviesData);
        setTheatres(theatresData);

      } catch (error) {
        console.log("API ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!movies.length || loading) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === movies.length - 1 ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(interval);
  }, [movies, loading]);

  const goTo = (i) => setCurrentSlide((i + movies.length) % movies.length);

  const filteredMovies = movies.filter((movie) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    if (searchType === "name") return movie.title?.toLowerCase().includes(query);
    if (searchType === "language")
      return movie.movieLanguage?.toLowerCase().includes(query);
    if (searchType === "genre")
      return movie.genre?.toLowerCase().includes(query);
    return true;
  });

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!movies.length) {
    return (
      <div className="p-10 text-center">
        ❌ No movies found. Add movies from admin panel.
      </div>
    );
  }

  const currentMovie = movies[currentSlide];

  return (
    <div className="p-4">
      {/* HERO */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">{currentMovie.title}</h1>
        <img
          src={currentMovie.poster}
          alt={currentMovie.title}
          className="mx-auto mt-4 h-64 object-cover"
        />
        <p className="mt-2">{currentMovie.genre} | ⭐ {currentMovie.rating}</p>

        <Link to={`/movie/${currentMovie._id}`}>
          <button className="mt-3 px-4 py-2 bg-red-600 text-white rounded">
            {isAdmin ? "Edit Movie" : "Book Now"}
          </button>
        </Link>
      </div>

      {/* SEARCH */}
      <div className="mb-6 text-center">
        <input
          type="text"
          placeholder="Search movies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        />
      </div>

      {/* MOVIES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredMovies.map((movie) => (
          <Link key={movie._id} to={`/movie/${movie._id}`}>
            <div className="border p-2 rounded hover:shadow">
              <img
                src={movie.poster}
                alt={movie.title}
                className="h-40 w-full object-cover"
              />
              <h3 className="text-sm font-semibold mt-2">
                {movie.title}
              </h3>
              <p className="text-xs text-gray-500">
                {movie.movieLanguage}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MoviesPage;