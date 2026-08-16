import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";

function MovieCard({ movie }) {
  const navigate = useNavigate();

  // Fallback poster generator if local poster path isn't served statically yet
  const getPosterSrc = () => {
    if (movie.poster && movie.poster.startsWith("http")) return movie.poster;
    if (movie.fallbackPoster) return movie.fallbackPoster;
    return `https://picsum.photos/seed/${encodeURIComponent(movie.title || "movie")}/400/600`;
  };

  return (
    <Motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      onClick={() => navigate(`/movie/${movie._id}`)}
      className="bg-[#faf7f2] rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-[#e7dac8] hover:border-[#8b1e3f] cursor-pointer group flex flex-col justify-between"
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full bg-[#f5efe6] overflow-hidden">
        <img
          src={getPosterSrc()}
          alt={movie.title}
          onError={(e) => {
            if (movie.fallbackPoster) {
              e.target.src = movie.fallbackPoster;
            } else {
              e.target.src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80";
            }
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Certificate Badge & Language Chip Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="bg-[#5b0f1b]/90 text-white text-[11px] font-black px-2.5 py-1 rounded-md backdrop-blur-sm tracking-wider uppercase shadow-sm border border-white/20">
            {movie.certificate || "UA"}
          </span>
          <span className="bg-black/70 text-amber-300 text-[11px] font-bold px-2 py-1 rounded-md backdrop-blur-sm">
            {movie.movieLanguage || movie.language || "Hindi"}
          </span>
        </div>

        {/* Rating Badge Overlay */}
        <div className="absolute top-3 right-3 bg-amber-500/90 text-[#2e1c14] font-black text-xs px-2.5 py-1 rounded-md backdrop-blur-sm flex items-center gap-1 shadow-sm">
          <span>★</span>
          <span>{movie.rating ? movie.rating.toFixed(1) : "8.5"}</span>
        </div>

        {/* Quick View Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#5b0f1b]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span className="bg-[#8b1e3f] text-white text-xs font-bold w-full py-2.5 text-center rounded-xl shadow-lg">
            View Showtimes & Theatres
          </span>
        </div>
      </div>

      {/* Details Footer */}
      <div className="p-4 flex flex-col justify-between grow">
        <div>
          <h3 className="text-lg font-extrabold text-[#5b0f1b] group-hover:text-[#8b1e3f] transition-colors line-clamp-1 leading-snug">
            {movie.title}
          </h3>

          <p className="text-xs text-[#4b2e1e] font-medium mt-1">
            {movie.genre || "Action / Drama"}
          </p>
        </div>

        <div className="mt-3 pt-3 border-t border-[#e7dac8]/60 flex items-center justify-between text-xs text-[#4b2e1e]">
          <span className="flex items-center gap-1 font-semibold">
            <svg className="w-3.5 h-3.5 text-[#8b1e3f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {movie.duration} mins
          </span>

          <span className="text-[#8b1e3f] font-bold group-hover:underline flex items-center gap-0.5">
            Book Now &rarr;
          </span>
        </div>
      </div>
    </Motion.div>
  );
}

export default MovieCard;
