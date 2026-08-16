import { useEffect, useState, useContext, useMemo, useRef } from "react";
import API from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
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
  const navigate = useNavigate();

  // Scroll Container Refs
  const allMoviesRef = useRef(null);
  const topRatedRef = useRef(null);
  const theatresRef = useRef(null);

  const scrollLeft = (ref) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -ref.current.clientWidth * 0.85, behavior: "smooth" });
    }
  };

  const scrollRight = (ref) => {
    if (ref.current) {
      ref.current.scrollBy({ left: ref.current.clientWidth * 0.85, behavior: "smooth" });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Safe poster source helper
  const getPosterSrc = (movie) => {
    if (!movie) return "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80";
    if (movie.poster && movie.poster.startsWith("http")) return movie.poster;
    if (movie.fallbackPoster) return movie.fallbackPoster;
    return "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80";
  };

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, theatresRes] = await Promise.all([
          API.get("/movies"),
          API.get("/theatres"),
        ]);

        const rawMovies = moviesRes.data?.movies || moviesRes.data?.data || moviesRes.data || [];
        const moviesData = Array.isArray(rawMovies)
          ? rawMovies.map((m, index) => ({
              ...m,
              _id: m._id || m.id || index.toString(),
              title: m.title || "Untitled",
              poster: m.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80",
              movieLanguage: m.movieLanguage || m.language || "Hindi",
              genre: m.genre || "Action",
              duration: m.duration || 120,
              rating: Number(m.rating || 8.5),
              description: m.description || m.story || "Experience the ultimate cinematic journey.",
            }))
          : [];

        const rawTheatres = theatresRes.data?.theatres || theatresRes.data?.data || theatresRes.data || [];

        setMovies(moviesData);
        setTheatres(Array.isArray(rawTheatres) ? rawTheatres : []);
      } catch (err) {
        console.log("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const heroMovies = useMemo(() => movies.slice(0, 6), [movies]);
  const heroCount = heroMovies.length;

  // HERO CAROUSEL AUTO-SLIDE TIMER
  useEffect(() => {
    if (heroCount === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroCount);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroCount]);

  const handlePrevSlide = () => {
    if (heroCount === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? heroCount - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    if (heroCount === 0) return;
    setCurrentSlide((prev) => (prev + 1) % heroCount);
  };

  // EXTRACT GENRES & LANGUAGES
  const genres = useMemo(() => {
    const list = new Set();
    movies.forEach((m) => {
      if (m.genre) {
        m.genre.split("/").forEach((g) => list.add(g.trim()));
      }
    });
    return ["All", ...Array.from(list)];
  }, [movies]);

  const languages = useMemo(() => {
    const list = new Set();
    movies.forEach((m) => {
      const lang = m.movieLanguage || m.language;
      if (lang) list.add(lang.trim());
    });
    return ["All", ...Array.from(list)];
  }, [movies]);

  // FILTERED MOVIES
  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.genre && m.genre.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesGenre =
        selectedGenre === "All" || (m.genre && m.genre.includes(selectedGenre));

      const matchesLang =
        selectedLanguage === "All" ||
        (m.movieLanguage || m.language) === selectedLanguage;

      return matchesSearch && matchesGenre && matchesLang;
    });
  }, [movies, searchQuery, selectedGenre, selectedLanguage]);

  // TOP RATED MOVIES (Top 6 Best Rated)
  const topRatedMovies = useMemo(() => {
    return [...movies].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6);
  }, [movies]);

  const activeHero = heroMovies[currentSlide] || heroMovies[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f3e9] p-4 sm:p-6 max-w-[1600px] mx-auto space-y-8">
        <div className="h-72 sm:h-96 w-[80%] mx-auto bg-[#e7dac8]/50 animate-pulse rounded-3xl" />
        <div className="h-20 bg-[#e7dac8]/50 animate-pulse rounded-2xl" />
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 w-48 bg-[#e7dac8]/50 animate-pulse rounded-2xl shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f3e9]">
      
      {/* 80% WIDTH HERO CAROUSEL SECTION (PERFECTLY PROPORTIONED & ZERO OVERLAP) */}
      {heroCount > 0 && activeHero && (
        <section className="relative w-[95%] md:w-[85%] lg:w-[80%] max-w-7xl mx-auto pt-3 sm:pt-6">
          <div className="relative bg-[#faf7f2] border border-[#e7dac8] rounded-3xl px-8 py-6 sm:p-7 md:p-8 shadow-sm flex flex-col md:flex-row items-center gap-6 sm:gap-8 overflow-hidden min-h-[380px] sm:min-h-[440px]">
            
            {/* Left Navigation Arrow */}
            <Motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrevSlide}
              aria-label="Previous Slide"
              className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-[#f5efe6] hover:bg-[#8b1e3f] text-[#5b0f1b] hover:text-white border border-[#e7dac8] shadow-md flex items-center justify-center transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </Motion.button>

            {/* Right Navigation Arrow */}
            <Motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNextSlide}
              aria-label="Next Slide"
              className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-[#f5efe6] hover:bg-[#8b1e3f] text-[#5b0f1b] hover:text-white border border-[#e7dac8] shadow-md flex items-center justify-center transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Motion.button>

            {/* Left Side: Movie Poster Card (Centered on mobile, spacious gap on desktop) */}
            <div className="w-full md:w-auto max-w-[180px] sm:max-w-[240px] shrink-0 mx-auto md:mx-0 md:ml-20">
              <AnimatePresence mode="wait">
                <Motion.div
                  key={activeHero._id || currentSlide}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.35 }}
                  className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-lg border border-[#e7dac8] bg-[#f5efe6]"
                >
                  <img
                    src={getPosterSrc(activeHero)}
                    alt={activeHero.title}
                    onError={(e) => { e.target.src = activeHero.fallbackPoster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80"; }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-[#5b0f1b] text-white text-[11px] font-black px-2.5 py-0.5 rounded shadow uppercase">
                    {activeHero.certificate || "UA"}
                  </div>
                  <div className="absolute top-2.5 right-2.5 bg-amber-500 text-[#2e1c14] text-[11px] font-extrabold px-2.5 py-0.5 rounded shadow">
                    ★ {activeHero.rating ? activeHero.rating.toFixed(1) : "8.5"}
                  </div>
                </Motion.div>
              </AnimatePresence>
            </div>

            {/* Right Side: Movie Details & Content */}
            <div className="w-full md:grow space-y-3 sm:space-y-4 px-6 sm:pr-16 md:pr-20 text-center md:text-left">
              <AnimatePresence mode="wait">
                <Motion.div
                  key={activeHero._id + "-text"}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-3"
                >
                  {/* Badges */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className="bg-[#f5efe6] text-[#8b1e3f] border border-[#e7dac8] text-xs font-bold px-3 py-1 rounded-full">
                      {activeHero.movieLanguage || "Hindi"}
                    </span>
                    <span className="bg-[#f5efe6] text-[#4b2e1e] border border-[#e7dac8] text-xs font-bold px-3 py-1 rounded-full">
                      {activeHero.genre || "Action"}
                    </span>
                    <span className="bg-[#f5efe6] text-[#4b2e1e] border border-[#e7dac8] text-xs font-bold px-3 py-1 rounded-full">
                      {activeHero.duration} mins
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif text-[#5b0f1b] tracking-tight leading-tight line-clamp-1">
                    {activeHero.title}
                  </h1>

                  {/* Story Preview */}
                  <p className="text-xs sm:text-sm text-[#4b2e1e] line-clamp-2 sm:line-clamp-3 leading-relaxed font-medium max-w-2xl">
                    {activeHero.story || activeHero.description}
                  </p>

                  {/* Action Button & Indicators */}
                  <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <Motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => navigate(`/movie/${activeHero._id}`)}
                      className="bg-[#8b1e3f] hover:bg-[#5b0f1b] text-white font-extrabold px-7 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      <span>Book Tickets</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </Motion.button>

                    {/* Dots */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {heroMovies.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlide(idx)}
                          aria-label={`Go to slide ${idx + 1}`}
                          className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                            currentSlide === idx ? "w-6 sm:w-8 bg-[#8b1e3f]" : "w-2 sm:w-2.5 bg-[#e7dac8] hover:bg-[#8b1e3f]/50"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </Motion.div>
              </AnimatePresence>
            </div>

          </div>
        </section>
      )}

      {/* SEARCH & FILTERS SECTION */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-[#faf7f2] border border-[#e7dac8] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-center gap-3 sm:gap-4">
          
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-1/3 border border-[#e7dac8] rounded-xl sm:rounded-2xl px-4 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#8b1e3f] bg-white text-[#2e1c14] text-xs sm:text-sm font-medium"
          />

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="w-full md:w-1/4 border border-[#e7dac8] rounded-xl sm:rounded-2xl px-4 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#8b1e3f] bg-white text-[#2e1c14] text-xs sm:text-sm font-medium"
          >
            {genres.map((genre, i) => (
              <option key={i} value={genre}>{genre === "All" ? "All Genres" : genre}</option>
            ))}
          </select>

          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full md:w-1/4 border border-[#e7dac8] rounded-xl sm:rounded-2xl px-4 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#8b1e3f] bg-[#2e1c14] bg-white text-[#2e1c14] text-xs sm:text-sm font-medium"
          >
            {languages.map((lang, i) => (
              <option key={i} value={lang}>{lang === "All" ? "All Languages" : lang}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedGenre("All");
              setSelectedLanguage("All");
            }}
            className="w-full md:w-auto bg-[#8b1e3f] hover:bg-[#5b0f1b] text-white rounded-xl sm:rounded-2xl px-5 py-2.5 sm:py-3 font-semibold transition-all duration-300 shadow-md cursor-pointer text-xs sm:text-sm shrink-0"
          >
            Reset Filters
          </button>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="max-w-[1600px] mx-auto px-4 mb-6">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#8b1e3f]/40 to-transparent" />
      </div>

      {/* ALL MOVIES HORIZONTAL CAROUSEL (EXACT 6 VISIBLE CARDS, 0 CUTOFF) */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-4xl font-black text-[#5b0f1b]">
            All Movies
          </h2>

          <div className="flex items-center gap-3">
            <span className="text-[#4b2e1e] text-xs sm:text-sm font-bold bg-[#f5efe6] px-3 py-1 rounded-full border border-[#e7dac8] hidden sm:inline-block">
              {filteredMovies.length} Movies
            </span>

            {/* Left/Right Scroll Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scrollLeft(allMoviesRef)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#faf7f2] hover:bg-[#8b1e3f] text-[#5b0f1b] hover:text-white border border-[#e7dac8] shadow-sm flex items-center justify-center transition-all cursor-pointer"
                aria-label="Scroll left"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={() => scrollRight(allMoviesRef)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#faf7f2] hover:bg-[#8b1e3f] text-[#5b0f1b] hover:text-white border border-[#e7dac8] shadow-sm flex items-center justify-center transition-all cursor-pointer"
                aria-label="Scroll right"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Container */}
        <div
          ref={allMoviesRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 pt-1 px-0.5 snap-x snap-mandatory"
        >
          {filteredMovies.map((movie) => (
            <Link
              key={movie._id}
              to={`/movie/${movie._id}`}
              className="snap-start shrink-0 w-[calc((100%-1*0.75rem)/2)] sm:w-[calc((100%-2*0.75rem)/3)] md:w-[calc((100%-3*1rem)/4)] lg:w-[calc((100%-5*1rem)/6)]"
            >
              <Motion.div
                whileHover={{ y: -6 }}
                className="w-full bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-[#e7dac8] flex flex-col justify-between h-full"
              >
                <div className="relative aspect-[2/3] w-full bg-[#f5efe6]">
                  <img
                    src={getPosterSrc(movie)}
                    alt={movie.title}
                    onError={(e) => { e.target.src = movie.fallbackPoster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80"; }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-[#5b0f1b] text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                    {movie.certificate || "UA"}
                  </div>
                </div>

                <div className="p-3 flex flex-col justify-between grow">
                  <h3 className="font-bold text-[#3d080f] truncate text-xs sm:text-base">
                    {movie.title}
                  </h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[#8b1e3f] font-bold text-xs sm:text-sm">
                      ⭐ {movie.rating ? movie.rating.toFixed(1) : "8.5"}
                    </span>
                    <span className="text-gray-500 text-[11px] sm:text-xs truncate max-w-[70px]">
                      {movie.movieLanguage || movie.language}
                    </span>
                  </div>
                </div>
              </Motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* DIVIDER */}
      <div className="max-w-[1600px] mx-auto px-4 mb-6">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#8b1e3f]/40 to-transparent" />
      </div>

      {/* TOP RATED CAROUSEL (EXACT 6 VISIBLE CARDS, 0 CUTOFF) */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-4xl font-black text-[#5b0f1b]">
            Top Rated
          </h2>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scrollLeft(topRatedRef)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#faf7f2] hover:bg-[#8b1e3f] text-[#5b0f1b] hover:text-white border border-[#e7dac8] shadow-sm flex items-center justify-center transition-all cursor-pointer"
              aria-label="Scroll left"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => scrollRight(topRatedRef)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#faf7f2] hover:bg-[#8b1e3f] text-[#5b0f1b] hover:text-white border border-[#e7dac8] shadow-sm flex items-center justify-center transition-all cursor-pointer"
              aria-label="Scroll right"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={topRatedRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 pt-1 px-0.5 snap-x snap-mandatory"
        >
          {topRatedMovies.map((movie) => (
            <Link
              key={movie._id}
              to={`/movie/${movie._id}`}
              className="snap-start shrink-0 w-[calc((100%-1*0.75rem)/2)] sm:w-[calc((100%-2*0.75rem)/3)] md:w-[calc((100%-3*1rem)/4)] lg:w-[calc((100%-5*1rem)/6)]"
            >
              <Motion.div
                whileHover={{ y: -6 }}
                className="w-full bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-[#e7dac8] flex flex-col justify-between h-full"
              >
                <div className="relative aspect-[2/3] w-full bg-[#f5efe6]">
                  <img
                    src={getPosterSrc(movie)}
                    alt={movie.title}
                    onError={(e) => { e.target.src = movie.fallbackPoster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80"; }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-amber-500 text-[#2e1c14] text-[10px] font-black px-2 py-0.5 rounded shadow">
                    TOP
                  </div>
                </div>

                <div className="p-3 flex flex-col justify-between grow">
                  <h3 className="font-bold text-[#3d080f] truncate text-xs sm:text-base">
                    {movie.title}
                  </h3>
                  <p className="text-[#8b1e3f] font-bold mt-1 text-xs sm:text-sm">
                    ⭐ {movie.rating ? movie.rating.toFixed(1) : "8.5"}/10
                  </p>
                </div>
              </Motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* DIVIDER */}
      <div className="max-w-[1600px] mx-auto px-4 mb-6">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#8b1e3f]/40 to-transparent" />
      </div>

      {/* THEATRES HORIZONTAL SCROLL CAROUSEL */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-20">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-4xl font-black text-[#5b0f1b]">
            All Theatres
          </h2>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scrollLeft(theatresRef)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#faf7f2] hover:bg-[#8b1e3f] text-[#5b0f1b] hover:text-white border border-[#e7dac8] shadow-sm flex items-center justify-center transition-all cursor-pointer"
              aria-label="Scroll left"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => scrollRight(theatresRef)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#faf7f2] hover:bg-[#8b1e3f] text-[#5b0f1b] hover:text-white border border-[#e7dac8] shadow-sm flex items-center justify-center transition-all cursor-pointer"
              aria-label="Scroll right"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={theatresRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 pt-1 px-0.5 snap-x snap-mandatory"
        >
          {theatres.map((theatre, index) => (
            <Motion.div
              key={theatre._id || index}
              whileHover={{ y: -5 }}
              className="snap-start shrink-0 w-[calc((100%-1rem)/1)] sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-2*1rem)/3)] lg:w-[calc((100%-4*1rem)/5)] bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-[#e7dac8] flex flex-col justify-between"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#f5efe6] flex items-center justify-center text-lg sm:text-xl shrink-0 text-[#8b1e3f] font-bold">
                  🎭
                </div>
                <div>
                  <h3 className="font-bold text-[#3d080f] text-sm sm:text-base line-clamp-1">
                    {theatre.name || theatre.theatreName}
                  </h3>
                  <p className="text-gray-500 text-[11px] sm:text-xs mt-0.5">
                    📍 {theatre.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#e7dac8]/60">
                <span className="text-[11px] sm:text-xs text-gray-600 font-medium">
                  Seats: {theatre.totalSeats || 100}
                </span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold">
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