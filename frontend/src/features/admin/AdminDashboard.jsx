import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api"; 
import { toast } from "react-toastify";

function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("movies");
  
  // Data States
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  
  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [movieForm, setMovieForm] = useState({ title: "", description: "", duration: "", genre: "", language: "", poster: "" });
  const [theatreForm, setTheatreForm] = useState({ name: "", location: "", totalSeats: 100 });
  const [showForm, setShowForm] = useState({ movie: "", theatre: "", showTime: "", price: 200 });

  // Fetch Data
  const fetchMovies = async () => { try { const res = await API.get("/movies"); setMovies(res.data || []); } catch (err) { console.log(err); } };
  const fetchTheatres = async () => { try { const res = await API.get("/theatres"); setTheatres(res.data || []); } catch (err) { console.log(err); } };
  const fetchShows = async () => { try { const res = await API.get("/shows"); setShows(res.data || []); } catch (err) { console.log(err); } };

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["movies", "theatres", "shows"].includes(tab)) setActiveTab(tab);
    fetchMovies(); fetchTheatres(); fetchShows();
  }, [searchParams]);

  // Handlers for Opening Modals
  const openAddModal = () => {
    setEditingId(null);
    setMovieForm({ title: "", description: "", duration: "", genre: "", language: "", poster: "" });
    setTheatreForm({ name: "", location: "", totalSeats: 100 });
    setShowForm({ movie: "", theatre: "", showTime: "", price: 200 });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // --- SUBMIT HANDLERS ---
  const handleMovieSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await API.put("/movies/" + editingId, movieForm);
      else await API.post("/movies", movieForm);
      toast.success(editingId ? "Movie updated" : "Movie added");
      closeModal(); fetchMovies();
    } catch (err) { toast.error("Failed"); }
  };

  const handleTheatreSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await API.put("/theatres/" + editingId, theatreForm);
      else await API.post("/theatres", theatreForm);
      toast.success(editingId ? "Theatre updated" : "Theatre added");
      closeModal(); fetchTheatres();
    } catch (err) { toast.error("Failed"); }
  };

  const handleShowSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await API.put("/shows/" + editingId, showForm);
      else await API.post("/shows", showForm);
      toast.success(editingId ? "Show updated" : "Show added");
      closeModal(); fetchShows();
    } catch (err) { toast.error("Failed"); }
  };

  // --- DELETE HANDLERS ---
  const deleteMovie = async (id) => { if (window.confirm("Delete movie?")) { try { await API.delete("/movies/" + id); toast.success("Deleted"); fetchMovies(); } catch (err) { toast.error("Failed"); } } };
  const deleteTheatre = async (id) => { if (window.confirm("Delete theatre?")) { try { await API.delete("/theatres/" + id); toast.success("Deleted"); fetchTheatres(); } catch (err) { toast.error("Failed"); } } };
  const deleteShow = async (id) => { if (window.confirm("Delete show?")) { try { await API.delete("/shows/" + id); toast.success("Deleted"); fetchShows(); } catch (err) { toast.error("Failed"); } } };

  // --- EDIT HANDLERS ---
  const editMovie = (movie) => { setMovieForm({ title: movie.title, description: movie.description, duration: movie.duration, genre: movie.genre, language: movie.language, poster: movie.poster }); setEditingId(movie._id); setIsModalOpen(true); };
  const editTheatre = (theatre) => { setTheatreForm({ name: theatre.name, location: theatre.location, totalSeats: theatre.totalSeats }); setEditingId(theatre._id); setIsModalOpen(true); };
  const editShow = (show) => { const showDate = new Date(show.showTime); setShowForm({ movie: show.movie._id, theatre: show.theatre._id, showTime: showDate.toISOString().slice(0, 16), price: show.price }); setEditingId(show._id); setIsModalOpen(true); };

  // UI Components
  const tabs = [
    { id: "movies", label: "Movies", icon: "🎬" },
    { id: "theatres", label: "Theatres", icon: "🏢" },
    { id: "shows", label: "Shows", icon: "🎟️" },
  ];

  return (
    <div className="flex h-screen bg-[#f5efe6] font-sans overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <div className="w-64 bg-[#1a1614] text-white flex flex-col shadow-2xl z-20 hidden md:flex">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-black text-[#f5efe6] tracking-wider ">TicketPeChalo.in</h1>
          <p className="text-xs text-gray-400 mt-1">Management Portal</p>
        </div>
        <div className="flex-1 px-4 py-6 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left font-medium ${
                activeTab === tab.id ? "bg-[#7a1c1c] text-white shadow-lg" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        
        {/* Header */}
        <header className="bg-white px-8 py-5 shadow-sm flex justify-between items-center z-10 sticky top-0">
          <h2 className="text-2xl font-bold text-[#1a1614] capitalize border-l-4 border-[#7a1c1c] pl-3">
            Manage {activeTab}
          </h2>
          <button 
            onClick={openAddModal}
            className="bg-[#7a1c1c] hover:bg-[#5c1414] text-white px-5 py-2.5 rounded-md font-semibold transition-all shadow-md flex items-center gap-2"
          >
            <span>+</span> Add New {activeTab.slice(0, -1)}
          </button>
        </header>

        <div className="p-8">
          
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {activeTab === 'movies' && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2d6c8] border-l-4 border-l-[#7a1c1c]">
                <p className="text-gray-500 text-sm font-semibold uppercase">Total Movies</p>
                <h3 className="text-3xl font-black text-[#1a1614] mt-1">{movies.length}</h3>
              </div>
            )}
            {activeTab === 'theatres' && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2d6c8] border-l-4 border-l-[#e67e22]">
                <p className="text-gray-500 text-sm font-semibold uppercase">Total Theatres</p>
                <h3 className="text-3xl font-black text-[#1a1614] mt-1">{theatres.length}</h3>
              </div>
            )}
            {activeTab === 'shows' && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2d6c8] border-l-4 border-l-[#2980b9]">
                <p className="text-gray-500 text-sm font-semibold uppercase">Active Shows</p>
                <h3 className="text-3xl font-black text-[#1a1614] mt-1">{shows.length}</h3>
              </div>
            )}
          </div>

          {/* TABLE SECTION */}
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-[#e2d6c8] overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#faf7f2] text-gray-600 uppercase text-xs font-bold border-b border-[#e2d6c8]">
                    {activeTab === "movies" && <><th className="p-4">Movie</th><th className="p-4">Genre</th><th className="p-4">Language</th><th className="p-4 text-right">Actions</th></>}
                    {activeTab === "theatres" && <><th className="p-4">Theatre Name</th><th className="p-4">Location</th><th className="p-4">Total Seats</th><th className="p-4 text-right">Actions</th></>}
                    {activeTab === "shows" && <><th className="p-4">Movie</th><th className="p-4">Theatre</th><th className="p-4">Show Time</th><th className="p-4">Price</th><th className="p-4 text-right">Actions</th></>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2d6c8]">
                  
                  {/* MOVIES TABLE */}
                  {activeTab === "movies" && movies.map((movie) => (
                    <tr key={movie._id} className="hover:bg-[#faf7f2]/50 transition">
                      <td className="p-4 flex items-center gap-4">
                        <img src={movie.poster} alt={movie.title} className="w-12 h-16 object-cover rounded shadow-sm" />
                        <div>
                          <p className="font-bold text-[#1a1614]">{movie.title}</p>
                          <p className="text-xs text-gray-500">{movie.duration} mins</p>
                        </div>
                      </td>
                      <td className="p-4"><span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">{movie.genre}</span></td>
                      <td className="p-4 font-medium text-gray-700">{movie.movieLanguage}</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => editMovie(movie)} className="text-blue-600 hover:text-blue-800 font-medium text-sm px-2">Edit</button>
                        <button onClick={() => deleteMovie(movie._id)} className="text-red-600 hover:text-red-800 font-medium text-sm px-2">Delete</button>
                      </td>
                    </tr>
                  ))}

                  {/* THEATRES TABLE */}
                  {activeTab === "theatres" && theatres.map((theatre) => (
                    <tr key={theatre._id} className="hover:bg-[#faf7f2]/50 transition">
                      <td className="p-4 font-bold text-[#1a1614]">{theatre.name}</td>
                      <td className="p-4 text-gray-600">{theatre.location}</td>
                      <td className="p-4 font-medium text-gray-700">{theatre.totalSeats}</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => editTheatre(theatre)} className="text-blue-600 hover:text-blue-800 font-medium text-sm px-2">Edit</button>
                        <button onClick={() => deleteTheatre(theatre._id)} className="text-red-600 hover:text-red-800 font-medium text-sm px-2">Delete</button>
                      </td>
                    </tr>
                  ))}

                  {/* SHOWS TABLE */}
                  {activeTab === "shows" && shows.map((show) => (
                    <tr key={show._id} className="hover:bg-[#faf7f2]/50 transition">
                      <td className="p-4 font-bold text-[#1a1614]">{show.movie?.title || "Unknown"}</td>
                      <td className="p-4 text-gray-600">{show.theatre?.name || "Unknown"}</td>
                      <td className="p-4 font-medium text-gray-700">{new Date(show.showTime).toLocaleString()}</td>
                      <td className="p-4 font-bold text-[#7a1c1c]">₹{show.price}</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => editShow(show)} className="text-blue-600 hover:text-blue-800 font-medium text-sm px-2">Edit</button>
                        <button onClick={() => deleteShow(show._id)} className="text-red-600 hover:text-red-800 font-medium text-sm px-2">Delete</button>
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
              
              {/* Empty States */}
              {activeTab === "movies" && movies.length === 0 && <p className="text-center p-8 text-gray-500">No movies found. Add one above.</p>}
              {activeTab === "theatres" && theatres.length === 0 && <p className="text-center p-8 text-gray-500">No theatres found.</p>}
              {activeTab === "shows" && shows.length === 0 && <p className="text-center p-8 text-gray-500">No shows found.</p>}
            </div>
          </motion.div>

        </div>
      </div>

      {/* --- MODAL / POP-UP FOR FORMS --- */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#e2d6c8]"
            >
              <div className="flex justify-between items-center p-6 border-b border-[#e2d6c8] bg-[#faf7f2]">
                <h3 className="text-xl font-bold text-[#1a1614]">
                  {editingId ? "Edit" : "Add New"} {activeTab.slice(0, -1)}
                </h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-red-600 font-bold text-xl">&times;</button>
              </div>

              <div className="p-6">
                
                {/* MOVIE FORM */}
                {activeTab === "movies" && (
                  <form onSubmit={handleMovieSubmit} className="space-y-4">
                    <input type="text" placeholder="Movie Title" required value={movieForm.title} onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1c1c] outline-none transition" />
                    <textarea placeholder="Description" required rows={3} value={movieForm.description} onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1c1c] outline-none transition" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="number" placeholder="Duration (mins)" required value={movieForm.duration} onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]" />
                      <input type="text" placeholder="Genre" required value={movieForm.genre} onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="Language" required value={movieForm.language} onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]" />
                      <input type="url" placeholder="Poster Image URL" required value={movieForm.poster} onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]" />
                    </div>
                    <button type="submit" className="w-full bg-[#7a1c1c] hover:bg-[#5c1414] text-white font-bold py-3 rounded-lg transition mt-4">{editingId ? "Update Movie" : "Save Movie"}</button>
                  </form>
                )}

                {/* THEATRE FORM */}
                {activeTab === "theatres" && (
                  <form onSubmit={handleTheatreSubmit} className="space-y-4">
                    <input type="text" placeholder="Theatre Name" required value={theatreForm.name} onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1c1c] outline-none transition" />
                    <input type="text" placeholder="Location" required value={theatreForm.location} onChange={(e) => setTheatreForm({ ...theatreForm, location: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1c1c] outline-none transition" />
                    <input type="number" placeholder="Total Seats" required value={theatreForm.totalSeats} onChange={(e) => setTheatreForm({ ...theatreForm, totalSeats: parseInt(e.target.value) })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1c1c] outline-none transition" />
                    <button type="submit" className="w-full bg-[#7a1c1c] hover:bg-[#5c1414] text-white font-bold py-3 rounded-lg transition mt-4">{editingId ? "Update Theatre" : "Save Theatre"}</button>
                  </form>
                )}

                {/* SHOW FORM */}
                {activeTab === "shows" && (
                  <form onSubmit={handleShowSubmit} className="space-y-4">
                    <select required value={showForm.movie} onChange={(e) => setShowForm({ ...showForm, movie: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1c1c] outline-none transition bg-white">
                      <option value="">Select Movie</option>
                      {movies.map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}
                    </select>
                    <select required value={showForm.theatre} onChange={(e) => setShowForm({ ...showForm, theatre: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1c1c] outline-none transition bg-white">
                      <option value="">Select Theatre</option>
                      {theatres.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                    <input type="datetime-local" required value={showForm.showTime} onChange={(e) => setShowForm({ ...showForm, showTime: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1c1c] outline-none transition" />
                    <input type="number" placeholder="Ticket Price (₹)" required value={showForm.price} onChange={(e) => setShowForm({ ...showForm, price: parseInt(e.target.value) })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1c1c] outline-none transition" />
                    <button type="submit" className="w-full bg-[#7a1c1c] hover:bg-[#5c1414] text-white font-bold py-3 rounded-lg transition mt-4">{editingId ? "Update Show" : "Save Show"}</button>
                  </form>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default AdminDashboard;