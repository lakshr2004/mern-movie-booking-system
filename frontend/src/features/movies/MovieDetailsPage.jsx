import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import API from "../../services/api";
import MovieDetail from "./MovieDetail";

function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const res = await API.get("/movies/" + id);
        setMovie(res.data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f3e9] p-6 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[#e7dac8] w-32 rounded-lg" />
          <div className="h-96 bg-[#e7dac8] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#f8f3e9] flex items-center justify-center p-4">
        <div className="text-center bg-[#faf7f2] border border-[#e7dac8] p-8 rounded-2xl">
          <h2 className="text-2xl font-bold text-[#5b0f1b] mb-4">
            Movie Not Found
          </h2>
          <Link to="/" className="bg-[#8b1e3f] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
            Back to Now Showing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#f8f3e9] px-4 py-6 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-[#5b0f1b] hover:text-[#8b1e3f] font-extrabold text-sm transition"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        Back to All Movies
      </button>

      {/* Movie Detail Component */}
      <MovieDetail movie={movie} />
    </Motion.div>
  );
}

export default MovieDetailsPage;