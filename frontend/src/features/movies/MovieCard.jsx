import { useNavigate } from "react-router-dom";

function MovieCard({ movie }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/shows/${movie._id}`)}
      className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition duration-300 cursor-pointer"
    >
      <img
        src={movie.poster}
        alt={movie.title}
        onError={(e) => {
          e.target.src = "https://picsum.photos/400/600";
        }}
        className="w-full h-80 object-cover"
      />

      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">
          {movie.title}
        </h2>

        <p className="text-gray-400 text-sm mb-2">
          {movie.genre} • {movie.movieLanguage}
        </p>

        <p className="text-gray-400 text-sm">
          Duration: {movie.duration} min
        </p>
      </div>
    </div>
  );
}

export default MovieCard;
