import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import { toast } from "react-toastify";

function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("movies");
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [movieForm, setMovieForm] = useState({ title: "", description: "", duration: "", genre: "", language: "", poster: "" });
  const [theatreForm, setTheatreForm] = useState({ name: "", location: "", totalSeats: 100 });
  const [showForm, setShowForm] = useState({ movie: "", theatre: "", showTime: "", price: 200 });
  const [editingId, setEditingId] = useState(null);

  const fetchMovies = async () => {
    try {
      const res = await API.get("/movies");
      setMovies(res.data);
    } catch (err) { console.log(err); }
  };

  const fetchTheatres = async () => {
    try {
      const res = await API.get("/theatres");
      setTheatres(res.data);
    } catch (err) { console.log(err); }
  };

  const fetchShows = async () => {
    try {
      const res = await API.get("/shows");
      setShows(res.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["movies", "theatres", "shows"].includes(tab)) {
      setActiveTab(tab);
    }
    fetchMovies();
    fetchTheatres();
    fetchShows();
  }, [searchParams]);

  const handleMovieSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put("/movies/" + editingId, movieForm);
        toast.success("Movie updated");
      } else {
        await API.post("/movies", movieForm);
        toast.success("Movie added");
      }
      setMovieForm({ title: "", description: "", duration: "", genre: "", language: "", poster: "" });
      setEditingId(null);
      fetchMovies();
    } catch (err) { toast.error("Failed"); }
  };

  const deleteMovie = async (id) => {
    if (!window.confirm("Delete movie?")) return;
    try {
      await API.delete("/movies/" + id);
      toast.success("Deleted");
      fetchMovies();
    } catch (err) { toast.error("Failed"); }
  };

  const editMovie = (movie) => {
    setMovieForm({ title: movie.title, description: movie.description, duration: movie.duration, genre: movie.genre, language: movie.movieLanguage, poster: movie.poster });
    setEditingId(movie._id);
  };

  const handleTheatreSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put("/theatres/" + editingId, theatreForm);
        toast.success("Theatre updated");
      } else {
        await API.post("/theatres", theatreForm);
        toast.success("Theatre added");
      }
      setTheatreForm({ name: "", location: "", totalSeats: 100 });
      setEditingId(null);
      fetchTheatres();
    } catch (err) { toast.error("Failed"); }
  };

  const deleteTheatre = async (id) => {
    if (!window.confirm("Delete theatre?")) return;
    try {
      await API.delete("/theatres/" + id);
      toast.success("Deleted");
      fetchTheatres();
    } catch (err) { toast.error("Failed"); }
  };

  const editTheatre = (theatre) => {
    setTheatreForm({ name: theatre.name, location: theatre.location, totalSeats: theatre.totalSeats });
    setEditingId(theatre._id);
  };

  const handleShowSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put("/shows/" + editingId, showForm);
        toast.success("Show updated");
      } else {
        await API.post("/shows", showForm);
        toast.success("Show added");
      }
      setShowForm({ movie: "", theatre: "", showTime: "", price: 200 });
      setEditingId(null);
      fetchShows();
    } catch (err) { toast.error("Failed"); }
  };

  const deleteShow = async (id) => {
    if (!window.confirm("Delete show?")) return;
    try {
      await API.delete("/shows/" + id);
      toast.success("Deleted");
      fetchShows();
    } catch (err) { toast.error("Failed"); }
  };

  const editShow = (show) => {
    const showDate = new Date(show.showTime);
    setShowForm({ movie: show.movie._id, theatre: show.theatre._id, showTime: showDate.toISOString().slice(0, 16), price: show.price });
    setEditingId(show._id);
  };

  const tabs = [
    { id: "movies", label: "Movies" },
    { id: "theatres", label: "Theatres" },
    { id: "shows", label: "Shows" },
  ];

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className="min-h-screen bg-[#f5efe6] p-6">
      <div className="max-w-7xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center text-[#7a1c1c] mb-8"
        >
          Admin Dashboard
        </motion.h1>
        
        <motion.div 
          className="flex justify-center gap-4 mb-8 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setEditingId(null); }}
              className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === tab.id ? "bg-[#7a1c1c] text-white" : "bg-white text-[#7a1c1c] border border-[#7a1c1c]"}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "movies" && (
              <div className="grid lg:grid-cols-2 gap-8">
                <motion.div 
                  className="bg-white rounded-xl shadow-lg p-6 border border-[#e2d6c8]"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                >
                  <h2 className="text-xl font-bold text-[#7a1c1c] mb-4">{editingId ? "Edit Movie" : "Add New Movie"}</h2>
                  <form onSubmit={handleMovieSubmit} className="space-y-4">
                    <input type="text" placeholder="Movie Title" required value={movieForm.title} className="w-full p-3 border rounded bg-[#faf7f2]" onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })} />
                    <textarea placeholder="Description" required value={movieForm.description} className="w-full p-3 border rounded bg-[#faf7f2]" rows={3} onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="number" placeholder="Duration" required value={movieForm.duration} className="w-full p-3 border rounded bg-[#faf7f2]" onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })} />
                      <input type="text" placeholder="Genre" required value={movieForm.genre} className="w-full p-3 border rounded bg-[#faf7f2]" onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="Language" required value={movieForm.language} className="w-full p-3 border rounded bg-[#faf7f2]" onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })} />
                      <input type="text" placeholder="Poster URL" required value={movieForm.poster} className="w-full p-3 border rounded bg-[#faf7f2]" onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })} />
                    </div>
                    <motion.button type="submit" className="w-full bg-[#7a1c1c] hover:bg-[#5c1414] text-white py-3 rounded-lg transition" whileHover={{ scale: 1.02 }}>
                      {editingId ? "Update Movie" : "Add Movie"}
                    </motion.button>
                    {editingId && <button type="button" onClick={() => { setEditingId(null); setMovieForm({ title: "", description: "", duration: "", genre: "", language: "", poster: "" }); }} className="w-full bg-gray-500 text-white py-2 rounded-lg mt-2">Cancel</button>}
                  </form>
                </motion.div>
                
                <motion.div className="bg-white rounded-xl shadow-lg p-6 border border-[#e2d6c8]" variants={pageVariants} initial="initial" animate="animate">
                  <h2 className="text-xl font-bold text-[#7a1c1c] mb-4">All Movies ({movies.length})</h2>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {movies.map((movie) => (
                      <motion.div key={movie._id} className="flex gap-4 p-3 border rounded-lg" whileHover={{ scale: 1.01 }}>
                        <img src={movie.poster} alt={movie.title} className="w-16 h-20 object-cover rounded" />
                        <div className="flex-1">
                          <h3 className="font-bold">{movie.title}</h3>
                          <p className="text-sm text-gray-600">{movie.genre} | {movie.movieLanguage}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button onClick={() => editMovie(movie)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Edit</button>
                          <button onClick={() => deleteMovie(movie._id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === "theatres" && (
              <div className="grid lg:grid-cols-2 gap-8">
                <motion.div className="bg-white rounded-xl shadow-lg p-6 border border-[#e2d6c8]" variants={pageVariants} initial="initial" animate="animate">
                  <h2 className="text-xl font-bold text-[#7a1c1c] mb-4">{editingId ? "Edit Theatre" : "Add New Theatre"}</h2>
                  <form onSubmit={handleTheatreSubmit} className="space-y-4">
                    <input type="text" placeholder="Theatre Name" required value={theatreForm.name} className="w-full p-3 border rounded bg-[#faf7f2]" onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })} />
                    <input type="text" placeholder="Location" required value={theatreForm.location} className="w-full p-3 border rounded bg-[#faf7f2]" onChange={(e) => setTheatreForm({ ...theatreForm, location: e.target.value })} />
                    <input type="number" placeholder="Total Seats" required value={theatreForm.totalSeats} className="w-full p-3 border rounded bg-[#faf7f2]" onChange={(e) => setTheatreForm({ ...theatreForm, totalSeats: parseInt(e.target.value) })} />
                    <motion.button type="submit" className="w-full bg-[#7a1c1c] text-white py-3 rounded-lg" whileHover={{ scale: 1.02 }}>{editingId ? "Update" : "Add"}</motion.button>
                    {editingId && <button type="button" onClick={() => { setEditingId(null); setTheatreForm({ name: "", location: "", totalSeats: 100 }); }} className="w-full bg-gray-500 text-white py-2 rounded-lg mt-2">Cancel</button>}
                  </form>
                </motion.div>
                
                <motion.div className="bg-white rounded-xl shadow-lg p-6 border border-[#e2d6c8]" variants={pageVariants} initial="initial" animate="animate">
                  <h2 className="text-xl font-bold text-[#7a1c1c] mb-4">All Theatres ({theatres.length})</h2>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {theatres.map((theatre) => (
                      <motion.div key={theatre._id} className="flex justify-between items-center p-4 border rounded-lg" whileHover={{ scale: 1.01 }}>
                        <div>
                          <h3 className="font-bold">{theatre.name}</h3>
                          <p className="text-sm text-gray-600">{theatre.location}</p>
                          <p className="text-sm text-gray-500">Seats: {theatre.totalSeats}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button onClick={() => editTheatre(theatre)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Edit</button>
                          <button onClick={() => deleteTheatre(theatre._id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === "shows" && (
              <motion.div className="bg-white rounded-xl shadow-lg p-6 border border-[#e2d6c8] max-w-2xl mx-auto" variants={pageVariants} initial="initial" animate="animate">
                  <h2 className="text-xl font-bold text-[#7a1c1c] mb-4">{editingId ? "Edit Show" : "Add New Show"}</h2>
                  <form onSubmit={handleShowSubmit} className="space-y-4">
                    <select required value={showForm.movie} className="w-full p-3 border rounded bg-[#faf7f2]" onChange={(e) => setShowForm({ ...showForm, movie: e.target.value })}>
                      <option value="">Select Movie</option>
                      {movies.map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}
                    </select>
                    <select required value={showForm.theatre} className="w-full p-3 border rounded bg-[#faf7f2]" onChange={(e) => setShowForm({ ...showForm, theatre: e.target.value })}>
                      <option value="">Select Theatre</option>
                      {theatres.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                    <input type="datetime-local" required value={showForm.showTime} className="w-full p-3 border rounded bg-[#faf7f2]" onChange={(e) => setShowForm({ ...showForm, showTime: e.target.value })} />
                    <input type="number" placeholder="Price" required value={showForm.price} className="w-full p-3 border rounded bg-[#faf7f2]" onChange={(e) => setShowForm({ ...showForm, price: parseInt(e.target.value) })} />
                    <motion.button type="submit" className="w-full bg-[#7a1c1c] text-white py-3 rounded-lg" whileHover={{ scale: 1.02 }}>{editingId ? "Update" : "Add"}</motion.button>
                    {editingId && <button type="button" onClick={() => { setEditingId(null); setShowForm({ movie: "", theatre: "", showTime: "", price: 200 }); }} className="w-full bg-gray-500 text-white py-2 rounded-lg mt-2">Cancel</button>}
                  </form>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AdminDashboard;

