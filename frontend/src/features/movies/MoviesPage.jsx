import { useEffect, useState } from "react";
import API from "../../services/api";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";

function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("name"); // name, language, genre

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, theatresRes] = await Promise.all([
          API.get("/movies"),
          API.get("/theatres")
        ]);
        setMovies(moviesRes.data);
        setTheatres(theatresRes.data);
      } catch (error) {
        console.log(error);
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
    }, 4000);
    return () => clearInterval(interval);
  }, [movies, loading]);

  // Filter movies based on search
  const filteredMovies = movies.filter(movie => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    if (searchType === "name") {
      return movie.title?.toLowerCase().includes(query);
    } else if (searchType === "language") {
      return movie.movieLanguage?.toLowerCase().includes(query) || movie.language?.toLowerCase().includes(query);
    } else if (searchType === "genre") {
      return movie.genre?.toLowerCase().includes(query);
    }
    return true;
  });

  // Skeleton loader for hero section
  const HeroSkeleton = () => (
    <div className="bg-[#5b0f1b] py-3 px-1">
      <div className="relative h-[25vh] sm:h-[40vh] md:h-[50vh] lg:h-[55vh] w-[95%] sm:w-[80%] md:w-[70vw] lg:w-[50vw] mx-auto overflow-hidden rounded-xl sm:rounded-2xl shadow-xl">
        <div className="w-full h-full bg-gray-600 animate-pulse rounded-xl sm:rounded-2xl" />
      </div>
    </div>
  );

  // Skeleton loader for movie cards
  const MovieCardSkeleton = () => (
    <div className="min-w-[120px] xs:min-w-[140px] sm:min-w-[160px] md:min-w-[180px] lg:min-w-[200px]">
      <div className="relative rounded-lg sm:rounded-xl overflow-hidden shadow-lg">
        <div className="h-32 xs:h-36 sm:h-44 md:h-52 lg:h-56 xl:h-64 w-full bg-gray-300 animate-pulse" />
      </div>
      <div className="mt-1.5 sm:mt-2 h-3 sm:h-4 bg-gray-300 animate-pulse rounded w-3/4" />
      <div className="mt-1 h-2 sm:h-3 bg-gray-300 animate-pulse rounded w-1/2" />
    </div>
  );

  // Skeleton loader for theatre cards
  const TheatreCardSkeleton = () => (
    <div className="min-w-[140px] xs:min-w-[150px] sm:min-w-[180px] bg-white rounded-lg shadow-md p-2.5 sm:p-4">
      <div className="h-4 sm:h-5 bg-gray-300 animate-pulse rounded w-3/4 mb-1.5" />
      <div className="h-2.5 sm:h-3 bg-gray-300 animate-pulse rounded w-full mb-1" />
      <div className="h-2 bg-gray-300 animate-pulse rounded w-1/2" />
    </div>
  );

  if (loading) {
    return (
      <div className="bg-[#f8f3e9] min-h-screen">
        <HeroSkeleton />

        {/* Search Skeleton */}
        <section className="px-2 sm:px-6 py-3 bg-[#f0dbb2]">
          <div className="max-w-2xl mx-auto">
            <div className="h-12 bg-gray-300 animate-pulse rounded-xl" />
          </div>
        </section>

        {/* Now Showing Skeleton */}
        <section className="px-2 sm:px-6 md:px-16 py-4 sm:py-10 md:py-16 bg-[#f0dbb2]">
          <div className="h-6 sm:h-8 w-32 sm:w-40 bg-gray-300 animate-pulse rounded mb-3 sm:mb-6 md:mb-10" />
          <div className="flex gap-3 sm:gap-5 overflow-x-auto scrollbar-hide pb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="bg-[#f8f3e9] min-h-screen flex items-center justify-center">
        <div className="w-[90%] md:w-[80%] h-[40vh] md:h-[50vh] bg-gray-300 animate-pulse rounded-2xl" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-[#f8f3e9] text-[#4b2e1e] min-h-screen"
    >
      {/* Hero Section */}
      <div className="bg-[#5b0f1b] py-3 px-1">
        <div className="relative h-[25vh] sm:h-[40vh] md:h-[50vh] lg:h-[55vh] w-[95%] sm:w-[80%] md:w-[70vw] lg:w-[50vw] mx-auto overflow-hidden rounded-xl sm:rounded-2xl shadow-xl">
          {movies.map((movie, index) => (
            <div key={movie._id} className="absolute inset-0" style={{ opacity: index === currentSlide ? 1 : 0, transition: "opacity 0.8s" }}>
              <img src={movie.poster} alt={movie.title} className={`w-full h-full object-cover rounded-xl sm:rounded-2xl ${index === currentSlide ? "scale-110" : "scale-100"}`} style={{ transition: "transform 6s" }} />
              <div className="absolute inset-0 bg-gradient-to-r from-[#2a0710]/95 via-[#5b0f1b]/70 to-transparent rounded-xl sm:rounded-2xl" />
              {index === currentSlide && (
                <Motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="absolute left-2 sm:left-6 md:left-10 lg:left-12 bottom-2 sm:bottom-6 md:bottom-10 lg:bottom-16 max-w-[60%] sm:max-w-xs md:max-w-md lg:max-w-xl z-20"
                >
                  <h1 className="text-base sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-1 sm:mb-2 md:mb-3">{movie.title}</h1>
                  <p className="text-[10px] sm:text-xs md:text-sm lg:text-base text-[#f5e6e0] mb-1 sm:mb-2 md:mb-4 line-clamp-2">{movie.description}</p>
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <span className="bg-yellow-500 text-black px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded text-[10px] sm:text-xs font-bold flex items-center gap-0.5">
                      ⭐ {movie.rating}
                    </span>
                    <span className="bg-[#8b1e3f] text-white px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded text-[10px] sm:text-xs">{movie.genre}</span>
                  </div>
                  <Link to={`/movie/${movie._id}`} className="inline-block bg-[#8b1e3f] hover:bg-[#b02a4f] text-white px-3 sm:px-5 md:px-6 lg:px-8 py-1 sm:py-1.5 md:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs md:text-sm lg:text-base font-semibold shadow-lg transition">View Details</Link>
                </Motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar Section */}
      <section className="px-2 sm:px-6 py-3 sm:py-4 bg-[#f0dbb2]">
        <div className="max-w-3xl mx-auto">
          {/* Search Type Tabs */}
          <div className="flex justify-center mb-2">
            <div className="inline-flex bg-white rounded-lg shadow-md p-1">
              <button
                onClick={() => setSearchType("name")}
                className={`px-3 py-1.5 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition ${
                  searchType === "name" 
                    ? "bg-[#8b1e3f] text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                By Name
              </button>
              <button
                onClick={() => setSearchType("language")}
                className={`px-3 py-1.5 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition ${
                  searchType === "language" 
                    ? "bg-[#8b1e3f] text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                By Language
              </button>
              <button
                onClick={() => setSearchType("genre")}
                className={`px-3 py-1.5 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition ${
                  searchType === "genre" 
                    ? "bg-[#8b1e3f] text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                By Genre
              </button>
            </div>
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder={`Search movies by ${searchType}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 pr-10 rounded-xl border border-gray-300 focus:border-[#8b1e3f] focus:ring-2 focus:ring-[#8b1e3f]/20 outline-none text-sm sm:text-base shadow-sm bg-white text-black placeholder-gray-500"
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Search Results Info */}
          {searchQuery && (
            <div className="mt-2 text-center text-xs sm:text-sm text-gray-600">
              Found <span className="font-bold text-[#8b1e3f]">{filteredMovies.length}</span> movie(s) matching "{searchQuery}"
            </div>
          )}
        </div>
      </section>

      {/* Now Showing Section */}
      <section className="px-2 sm:px-6 md:px-16 py-4 sm:py-10 md:py-16 bg-[#f0dbb2]">
        <Motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold mb-3 sm:mb-6 md:mb-10 text-[#6b3e26]"
        >
          {searchQuery ? `Search Results (${filteredMovies.length})` : "Now Showing"}
        </Motion.h2>
        
        {filteredMovies.length > 0 ? (
          <Motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex gap-3 sm:gap-5 overflow-x-auto scrollbar-hide pb-2"
          >
            {filteredMovies.map((movie) => (
              <Motion.div key={movie._id} variants={itemVariants} whileHover={{ scale: 1.03 }}>
                <Link to={`/movie/${movie._id}`}>
                  <div className="relative rounded-lg sm:rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 min-w-[120px] xs:min-w-[140px] sm:min-w-[160px] md:min-w-[180px] lg:min-w-[200px]">
                    <img src={movie.poster} alt={movie.title} className="h-32 xs:h-36 sm:h-44 md:h-52 lg:h-56 xl:h-64 w-full object-cover" />

                    {/* Rating Badge */}
                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-yellow-500 text-black px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-0.5">
                      ⭐ {movie.rating}
                    </div>

                    {/* Genre Tag */}
                    <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 bg-[#8b1e3f]/90 text-white px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded text-[10px] sm:text-xs">
                      {movie.genre}
                    </div>

                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition">
                      <span className="bg-[#8b1e3f] text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs">View Details</span>
                    </div>
                  </div>
                  <h3 className="mt-1.5 sm:mt-2 font-semibold text-xs sm:text-sm md:text-base">{movie.title}</h3>
                  <p className="text-[10px] sm:text-xs text-gray-500">{movie.movieLanguage}</p>
                </Link>
              </Motion.div>
            ))}
          </Motion.div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm sm:text-base">No movies found matching your search.</p>
            <button 
              onClick={() => setSearchQuery("")}
              className="mt-2 text-[#8b1e3f] hover:underline text-sm"
            >
              Clear search
            </button>
          </div>
        )}
      </section>

      {/* Only show Top Rated and Theatres when not searching */}
      {!searchQuery && (
        <>
          {/* Top Rated Section */}
          <section className="px-2 sm:px-6 md:px-16 pb-6 sm:pb-12 md:pb-16 bg-[#f0dbb2]">
            <Motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold mb-3 sm:mb-6 md:mb-8 text-[#6b3e26]"
            >
              Top Rated
            </Motion.h2>
            <Motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 md:gap-6"
            >
              {movies.slice(0, 4).map((movie) => (
                <Motion.div key={movie._id} variants={itemVariants} whileHover={{ scale: 1.03 }}>
                  <Link to={`/movie/${movie._id}`}>
                    <div className="relative bg-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl overflow-hidden transition-shadow duration-300">
                      <img src={movie.poster} alt={movie.title} className="h-28 xs:h-32 sm:h-40 md:h-48 lg:h-52 w-full object-cover" />

                      {/* Rating Badge */}
                      <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-yellow-500 text-black px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-0.5">
                        ⭐ {movie.rating}
                      </div>

                      {/* Genre Tag */}
                      <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 bg-[#8b1e3f]/90 text-white px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded text-[10px] sm:text-xs">
                        {movie.genre}
                      </div>

                      <div className="p-1.5 sm:p-2.5 text-center font-semibold text-xs sm:text-sm md:text-base">{movie.title}</div>
                    </div>
                  </Link>
                </Motion.div>
              ))}
            </Motion.div>
          </section>

          {/* All Theatres Section */}
          <section className="px-2 sm:px-6 md:px-16 pb-6 sm:pb-16 bg-[#f0dbb2]">
            <Motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold mb-3 sm:mb-6 md:mb-8 text-[#6b3e26]"
            >
              All Theatres
            </Motion.h2>
            <Motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex gap-3 sm:gap-5 overflow-x-auto scrollbar-hide pb-2"
            >
              {theatres.map((theatre) => (
                <Motion.div
                  key={theatre._id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="min-w-[140px] xs:min-w-[150px] sm:min-w-[180px] md:min-w-[200px] bg-white rounded-lg shadow-md hover:shadow-lg p-2.5 sm:p-4 transition-shadow duration-300"
                >
                  <h3 className="text-xs sm:text-sm md:text-base font-semibold text-[#4b2e1e]">{theatre.name}</h3>
                  <p className="text-[10px] sm:text-xs md:text-sm text-[#6b3e26] mt-1">Location: {theatre.location}</p>
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 mt-0.5 sm:mt-1">Seats: {theatre.totalSeats}</p>
                </Motion.div>
              ))}
            </Motion.div>
          </section>
        </>
      )}

    </Motion.div>
  );
}

export default MoviesPage;

