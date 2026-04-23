import { useEffect, useState } from "react";
import API from "../../services/api";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";

function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("name");

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, theatresRes] = await Promise.all([
          API.get("/movies"),
          API.get("/theatres"),
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
    }, 4500);
    return () => clearInterval(interval);
  }, [movies, loading]);

  const goTo = (i) => setCurrentSlide((i + movies.length) % movies.length);

  const filteredMovies = movies.filter((movie) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    if (searchType === "name") return movie.title?.toLowerCase().includes(query);
    if (searchType === "language")
      return (
        movie.movieLanguage?.toLowerCase().includes(query) ||
        movie.language?.toLowerCase().includes(query)
      );
    if (searchType === "genre") return movie.genre?.toLowerCase().includes(query);
    return true;
  });

  /* ── Skeletons ── */
  const HeroSkeleton = () => (
    <div className="relative bg-[#f5f2ee] min-h-[340px] sm:min-h-[400px] flex items-center justify-between px-6 sm:px-12 md:px-20 gap-8 overflow-hidden">
      <div className="flex-1 space-y-4">
        <div className="h-3 w-20 bg-gray-200 animate-pulse rounded" />
        <div className="h-14 sm:h-20 w-64 bg-gray-200 animate-pulse rounded" />
        <div className="flex gap-2">
          {[1, 2, 3].map(i => <div key={i} className="h-6 w-16 bg-gray-200 animate-pulse rounded" />)}
        </div>
        <div className="h-10 w-28 bg-gray-200 animate-pulse rounded" />
      </div>
      <div className="flex-shrink-0 w-[140px] sm:w-[180px] md:w-[200px] h-[210px] sm:h-[265px] md:h-[295px] bg-gray-200 animate-pulse rounded-md" />
    </div>
  );

  const MovieCardSkeleton = () => (
    <div className="min-w-[120px] sm:min-w-[160px] md:min-w-[180px] lg:min-w-[200px]">
      <div className="h-40 sm:h-52 lg:h-64 w-full bg-gray-200 animate-pulse rounded-lg" />
      <div className="mt-2 h-3 bg-gray-200 animate-pulse rounded w-3/4" />
      <div className="mt-1 h-2.5 bg-gray-200 animate-pulse rounded w-1/2" />
    </div>
  );

  const TheatreCardSkeleton = () => (
    <div className="min-w-[150px] sm:min-w-[180px] bg-white rounded-lg shadow-sm p-3 sm:p-4">
      <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 animate-pulse rounded w-full mb-1" />
      <div className="h-2.5 bg-gray-200 animate-pulse rounded w-1/2" />
    </div>
  );

  if (loading) {
    return (
      <div className="bg-[#f5f2ee] min-h-screen">
        <HeroSkeleton />
        <section className="px-4 sm:px-8 py-4 bg-[#f5f2ee]">
          <div className="max-w-2xl mx-auto h-11 bg-gray-200 animate-pulse rounded-lg" />
        </section>
        <section className="px-4 sm:px-8 md:px-16 py-8 bg-[#f5f2ee]">
          <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-6" />
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5].map((i) => <MovieCardSkeleton key={i} />)}
          </div>
        </section>
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="bg-[#f5f2ee] min-h-screen flex items-center justify-center">
        <div className="w-[80%] h-[40vh] bg-gray-200 animate-pulse rounded-2xl" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 18, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" } },
  };

  const currentMovie = movies[currentSlide];

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-[#f5f2ee] text-[#1a1614] min-h-screen"
    >
      {/* ══════════════ HERO SECTION ══════════════ */}
      <div className="w-full max-w-[1300px] mx-auto relative bg-[#f5f2ee] overflow-hidden min-h-[300px] sm:min-h-[360px] md:min-h-[420px] px-4 sm:px-6 md:px-10 lg:px-16">

        {/* --- ANIMATED BACKGROUND START --- */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ opacity: 0.5 }}>
          {/* Swirling Orb 1 */}
          <Motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: ['0%', '10%', '-5%', '0%'],
              y: ['0%', '-10%', '10%', '0%'],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[10%] w-[50%] md:w-[40%] h-[70%] bg-gradient-to-tr from-[#ff4500] to-[#ff8c00] rounded-full blur-[80px] sm:blur-[120px] md:blur-[150px]"
          />
          
          {/* Swirling Orb 2 */}
          <Motion.div
            animate={{
              scale: [1, 1.3, 1],
              x: ['0%', '-15%', '10%', '0%'],
              y: ['0%', '15%', '-10%', '0%'],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[-10%] right-[10%] w-[45%] md:w-[35%] h-[60%] bg-gradient-to-bl from-[#ff2a00] to-[#ff6a00] rounded-full blur-[80px] sm:blur-[120px] md:blur-[150px]"
          />
        </div>
        {/* --- ANIMATED BACKGROUND END --- */}


        {/* Left arrow */}
        <button
          onClick={() => goTo(currentSlide - 1)}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-white border border-[#e0ddd8] rounded-sm flex items-center justify-center text-[#1a1614] text-sm hover:bg-[#1a1614] hover:text-[#f5f2ee] transition shadow-sm"
        >
          &#8592;
        </button>

        {/* Right arrow */}
        <button
          onClick={() => goTo(currentSlide + 1)}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-white border border-[#e0ddd8] rounded-sm flex items-center justify-center text-[#1a1614] text-sm hover:bg-[#1a1614] hover:text-[#f5f2ee] transition shadow-sm"
        >
          &#8594;
        </button>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center justify-between gap-6 md:gap-10 py-8 sm:py-10 md:py-12">

          {/* LEFT CONTENT */}
          <Motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="flex-1 text-center md:text-left"
          >

            <span className="inline-block border border-[#bbb8b2] text-[#888580] text-[10px] sm:text-xs uppercase px-2 py-0.5 rounded-sm mb-3 sm:mb-4">
              {currentMovie.genre || "Film"}
            </span>

            <h1
              className="text-[#1a1614] max-[400px]:text-xl max-[400px]:leading-[0.75] max-[400px]:mb-1 font-black tracking-tight"
              style={{
                fontFamily: "'Bebas Neue','Anton',sans-serif",
                fontSize: "clamp(22px, 8vw, 38px)"
              }}
            >
              {currentMovie.title}
            </h1>

            {/* Indicators - Hide below 400px */}
            <div className="hidden max-[400px]:hidden flex justify-center md:justify-start gap-1.5 mb-4 sm:mb-5">
              {movies.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="h-[3px] rounded-sm transition-all"
                  style={{
                    width: i === currentSlide ? "36px" : "18px",
                    background: i === currentSlide ? "#1a1614" : "#ccc9c3"
                  }}
                />
              ))}
            </div>

            {/* Movie info */}
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mb-5 sm:mb-7">

              {currentMovie.movieLanguage && (
                <span className="bg-[#1a1614]/10 text-[#3d3733] font-medium text-xs px-3 py-1 rounded-sm">
                  {currentMovie.movieLanguage}
                </span>
              )}

              {currentMovie.genre && (
                <span className="bg-[#1a1614]/10 text-[#3d3733] font-medium text-xs px-3 py-1 rounded-sm">
                  {currentMovie.genre}
                </span>
              )}

              {currentMovie.rating && (
                <span className="bg-amber-100 text-amber-800 font-medium text-xs px-3 py-1 rounded-sm">
                  ⭐ {currentMovie.rating}
                </span>
              )}

            </div>

            {/* Button */}
            <Link
              to={`/movie/${currentMovie._id}`}
              className="inline-flex items-center gap-2 bg-[#1a1614] text-[#f5f2ee] text-xs sm:text-sm uppercase px-6 sm:px-8 py-3 rounded-sm hover:bg-[#3d3733] transition"
            >
              Book now
            </Link>

          </Motion.div>


          {/* POSTER */}
          <Motion.div
            key={`poster-${currentSlide}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="flex-shrink-0"
          >

            <div
              className="rounded-md overflow-hidden relative"
              style={{
                width: "clamp(140px,28vw,260px)",
                height: "clamp(210px,38vw,380px)",
                boxShadow:
                  "0 8px 32px rgba(26,22,20,0.18), 0 2px 8px rgba(26,22,20,0.1)"
              }}
            >

              <img
                src={currentMovie.poster}
                alt={currentMovie.title}
                className="w-full h-full object-cover"
              />

              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(110deg, rgba(255,255,255,0.13) 0%, transparent 60%)"
                }}
              />

            </div>

          </Motion.div>

        </div>
      </div>




      {/* ══════════════ SEARCH SECTION ══════════════ */}
      <section className="px-4 sm:px-8 py-4 sm:py-5 bg-[#f5f2ee] border-b border-[#e8e4de]">
        <div className="max-w-2xl mx-auto">
          {/* Type tabs */}
          <div className="flex justify-center mb-3">
            <div className="inline-flex bg-white border border-[#e0ddd8] rounded-sm p-0.5">
              {["name", "language", "genre"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSearchType(type)}
                  className={`px-3 sm:px-4 py-1.5 rounded-sm text-xs font-medium tracking-wide uppercase transition-all duration-150 ${searchType === type
                    ? "bg-[#232222] text-[#f5f2ee]"
                    : "text-[#1c1c1b] hover:bg-[#f5f2ee]"
                    }`}
                >
                  {type === "name" ? "By Name" : type === "language" ? "By Language" : "By Genre"}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="relative">
            <input
              type="text"
              placeholder={`Search movies by ${searchType}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 sm:py-3 bg-white border border-[#e0ddd8] rounded-sm text-sm text-[#1a1614] placeholder-[#aaa7a2] outline-none focus:border-[#1a1614] transition-colors"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1c1c1b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa7a2] hover:text-[#1a1614] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          {searchQuery && (
            <p className="mt-2 text-center text-xs text-[#888580]">
              Found <span className="font-semibold text-[#1a1614]">{filteredMovies.length}</span> result{filteredMovies.length !== 1 ? "s" : ""} for "{searchQuery}"
            </p>
          )}
        </div>
      </section>



      {/* ══════════════ NOW SHOWING ══════════════ */}
      <section className="px-4 sm:px-8 md:px-14 lg:px-20 py-8 sm:py-12 bg-[#f5f2ee]">

        <Motion.h2
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-sm sm:text-base md:text-lg font-semibold tracking-widest uppercase text-[#888580] mb-4 sm:mb-6 md:mb-8"
        >
          {searchQuery ? `Results (${filteredMovies.length})` : "Now Showing"}
        </Motion.h2>

        {filteredMovies.length > 0 ? (
          <Motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-hide pb-3 snap-x snap-mandatory"
          >

            {filteredMovies.map((movie) => (
              <Motion.div
                key={movie._id}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="flex-shrink-0 snap-start 
          w-[140px] 
          sm:w-[160px] 
          md:w-[180px] 
          lg:w-[200px]"
              >

                <Link to={`/movie/${movie._id}`}>

                  <div className="relative rounded-md overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">

                    {/* Poster */}
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full 
                h-[200px] 
                sm:h-[230px] 
                md:h-[250px] 
                lg:h-[270px] 
                object-cover"
                    />

                    {/* Rating */}
                    <div className="absolute top-2 right-2 bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-sm text-[10px] font-bold">
                      ⭐ {movie.rating}
                    </div>

                    {/* Genre */}
                    <div className="absolute bottom-2 left-2 bg-[#1a1614]/80 text-[#f5f2ee] px-1.5 py-0.5 rounded-sm text-[10px] tracking-wide">
                      {movie.genre}
                    </div>

                    {/* Hover */}
                    <div className="absolute inset-0 bg-[#1a1614]/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      <span className="bg-white text-[#1a1614] text-xs font-medium px-3 py-1.5 rounded-sm tracking-wide">
                        View Details
                      </span>
                    </div>

                  </div>

                  <h3 className="mt-2 font-semibold text-xs sm:text-sm text-[#1a1614] leading-snug line-clamp-1">
                    {movie.title}
                  </h3>

                  <p className="text-[10px] sm:text-xs text-[#888580] mt-0.5">
                    {movie.movieLanguage}
                  </p>

                </Link>

              </Motion.div>
            ))}

          </Motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#888580] text-sm">
              No movies found for "{searchQuery}"
            </p>

            <button
              onClick={() => setSearchQuery("")}
              className="mt-2 text-[#1a1614] underline text-xs tracking-wide"
            >
              Clear search
            </button>
          </div>
        )}

      </section>



      {/* ══════════════ TOP RATED + THEATRES (hidden during search) ══════════════ */}
      {!searchQuery && (
        <>
          {/* Divider */}
          <div className="mx-4 sm:mx-8 md:mx-14 lg:mx-20 border-t border-[#31302d]" />

          {/* Top Rated */}
          <section className="px-4 sm:px-8 md:px-14 lg:px-20 py-8 sm:py-12 bg-[#f5f2ee]">
            <Motion.h2
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold tracking-widest uppercase text-[#888580] mb-6 sm:mb-8 md:mb-10 lg:mb-12"
            >
              Top Rated
            </Motion.h2>
            <Motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
            >
              {movies.slice(0, 8).sort((a, b) => b.rating - a.rating).map((movie) => (
                <Motion.div key={movie._id} variants={itemVariants} whileHover={{ y: -4 }}>
                  <Link to={`/movie/${movie._id}`}>
                    <div className="group relative bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#e8e4de] hover:border-[#1a1614]/50">
                      <div className="relative h-28 sm:h-36 md:h-40 lg:h-44 w-full overflow-hidden rounded-t-lg sm:rounded-t-xl">
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-orange-400 text-black px-2 py-1 rounded-full text-[9px] sm:text-xs font-bold shadow-lg backdrop-blur-sm">
                          ⭐ {movie.rating}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-14 md:h-16 bg-gradient-to-t from-black/85 via-black/60 to-transparent p-2 sm:p-3 flex items-end">
                          <h3 className="w-full text-[10px] sm:text-xs md:text-sm font-bold text-white px-3 truncate bg-gradient-to-r from-transparent via-white/30 to-transparent py-1 sm:py-1.5 rounded-t-lg backdrop-blur-md shadow-lg">
                            {movie.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Motion.div>
              ))}
            </Motion.div>
          </section>

          {/* Divider */}
          <div className="mx-4 sm:mx-8 md:mx-14 lg:mx-20 border-t border-[#31302d]" />

          {/* All Theatres */}
          <section className="px-4 sm:px-8 md:px-14 lg:px-20 py-8 sm:py-12 bg-[#f5f2ee]">
            <Motion.h2
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-sm sm:text-base md:text-lg font-semibold tracking-widest uppercase text-[#888580] mb-4 sm:mb-6 md:mb-8"
            >
              All Theatres
            </Motion.h2>
            <Motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2"
            >
              {theatres.map((theatre) => (
                <Motion.div
                  key={theatre._id}
                  variants={itemVariants}
                  whileHover={{ y: -3 }}
                  className="flex-shrink-0 min-w-[150px] sm:min-w-[180px] md:min-w-[210px] bg-white border border-[#e8e4de] rounded-md p-3 sm:p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <h3 className="text-xs sm:text-sm font-semibold text-[#1a1614] leading-snug">{theatre.name}</h3>
                  <p className="text-[10px] sm:text-xs text-[#888580] mt-1.5">📍 {theatre.location}</p>
                  <p className="text-[10px] sm:text-xs text-[#aaa7a2] mt-0.5">🪑 {theatre.totalSeats} seats</p>
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
