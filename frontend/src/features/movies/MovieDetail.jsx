import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";

function MovieDetail({ movie }) {
  const navigate = useNavigate();
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  if (!movie) return null;

  // Parse story lines (ensuring maximum 4 clean lines)
  const storyLines = movie.story
    ? movie.story.split("\n").filter((line) => line.trim().length > 0).slice(0, 4)
    : (movie.description || "").split("\n").filter((line) => line.trim().length > 0).slice(0, 4);

  const getPosterSrc = () => {
    if (movie.poster && movie.poster.startsWith("http")) return movie.poster;
    if (movie.fallbackPoster) return movie.fallbackPoster;
    return `https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80`;
  };

  const handleBookTicketsClick = () => {
    navigate(`/shows/${movie._id}`);
  };

  return (
    <div className="space-y-8">
      {/* Movie Main Banner & Details */}
      <div className="bg-[#faf7f2] border border-[#e7dac8] rounded-3xl p-5 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          
          {/* Movie Poster */}
          <div className="w-full md:w-1/3 max-w-[280px] mx-auto md:mx-0 shrink-0">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-lg border border-[#e7dac8]">
              <img
                src={getPosterSrc()}
                alt={movie.title}
                onError={(e) => {
                  e.target.src = movie.fallbackPoster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80";
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-[#5b0f1b] text-white text-xs font-black px-3 py-1 rounded-md shadow-md uppercase">
                {movie.certificate || "UA"}
              </div>
              <div className="absolute top-3 right-3 bg-amber-500 text-[#2e1c14] text-xs font-extrabold px-2.5 py-1 rounded-md shadow-md">
                ★ {movie.rating ? movie.rating.toFixed(1) : "8.5"} / 10
              </div>
            </div>
          </div>

          {/* Details, Story & Primary Actions */}
          <div className="w-full md:w-2/3 space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-[#f5efe6] text-[#8b1e3f] border border-[#e7dac8] text-xs font-bold px-3 py-1 rounded-full">
                  {movie.movieLanguage || movie.language || "Hindi"}
                </span>
                <span className="bg-[#f5efe6] text-[#4b2e1e] border border-[#e7dac8] text-xs font-bold px-3 py-1 rounded-full">
                  {movie.genre || "Action"}
                </span>
                <span className="bg-[#f5efe6] text-[#4b2e1e] border border-[#e7dac8] text-xs font-bold px-3 py-1 rounded-full">
                  {movie.duration} mins
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-[#5b0f1b] tracking-tight">
                {movie.title}
              </h1>
            </div>

            {/* Action Buttons: Book Tickets & View Trailer */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleBookTicketsClick}
                className="bg-[#8b1e3f] hover:bg-[#5b0f1b] text-white text-sm font-extrabold px-7 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <span>Book Tickets</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Motion.button>

              <Motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowTrailerModal(true)}
                className="bg-[#f5efe6] hover:bg-[#e7dac8] text-[#5b0f1b] border border-[#e7dac8] text-sm font-bold px-5 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <svg className="w-5 h-5 text-[#8b1e3f]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span>View Trailer</span>
              </Motion.button>
            </div>

            {/* Movie Description / Storyline (Maximum 4 Lines) */}
            <div className="bg-[#f5efe6]/70 border border-[#e7dac8] p-4 rounded-2xl space-y-1.5">
              <h3 className="text-xs font-bold text-[#8b1e3f] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Movie Description & Plot (Spoiler-Free)
              </h3>
              {storyLines.map((line, idx) => (
                <p key={idx} className="text-xs sm:text-sm text-[#2e1c14] leading-relaxed font-medium">
                  {line}
                </p>
              ))}
            </div>

            {/* Lead Cast List */}
            {movie.cast && movie.cast.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-[#5b0f1b] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#8b1e3f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Lead Cast & Characters
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {movie.cast.map((c, i) => (
                    <div key={i} className="bg-[#FAF7F2] border border-[#e7dac8] px-3 py-2 rounded-xl text-xs">
                      <div className="font-bold text-[#2e1c14]">{typeof c === "object" ? c.name : c}</div>
                      {typeof c === "object" && c.role && (
                        <div className="text-[11px] text-[#8b1e3f] font-medium italic">as {c.role}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TRAILER NOT AVAILABLE POPUP MODAL */}
      <AnimatePresence>
        {showTrailerModal && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            onClick={() => setShowTrailerModal(false)}
          >
            <Motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#faf7f2] border border-[#e7dac8] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 relative"
            >
              <button
                onClick={() => setShowTrailerModal(false)}
                className="absolute top-4 right-4 text-[#4b2e1e] hover:text-[#8b1e3f] font-bold text-lg cursor-pointer"
              >
                ✕
              </button>

              <div className="w-16 h-16 bg-[#f5efe6] text-[#8b1e3f] border border-[#e7dac8] rounded-full flex items-center justify-center mx-auto text-3xl shadow-sm">
                🎬
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-[#5b0f1b]">
                  View Trailer
                </h3>
                <p className="text-sm font-semibold text-[#4b2e1e] leading-relaxed">
                  This feature is not available right now.
                </p>
              </div>

              <div className="pt-2">
                <Motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowTrailerModal(false)}
                  className="bg-[#8b1e3f] hover:bg-[#5b0f1b] text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md text-sm transition-all cursor-pointer w-full"
                >
                  Got It
                </Motion.button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MovieDetail;
