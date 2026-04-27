import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import { toast } from "react-toastify";

function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    initialTab && ["movies", "theatres", "shows"].includes(initialTab) ? initialTab : "movies"
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [movieForm, setMovieForm] = useState({ title: "", description: "", duration: "", genre: "", movieLanguage: "", poster: "" });
  const [theatreForm, setTheatreForm] = useState({ name: "", location: "", totalSeats: 100 });
  const [showForm, setShowForm] = useState({ movie: "", theatre: "", showTime: "", price: 200 });

  const fetchMovies = async () => { try { const res = await API.get("/movies"); setMovies(res.data || []); } catch (err) { console.log(err); } };
  const fetchTheatres = async () => { try { const res = await API.get("/theatres"); setTheatres(res.data || []); } catch (err) { console.log(err); } };
  const fetchShows = async () => { try { const res = await API.get("/shows"); setShows(res.data || []); } catch (err) { console.log(err); } };

  useEffect(() => {
    fetchMovies(); fetchTheatres(); fetchShows();
  }, [searchParams]);

  const openAddModal = () => {
    setEditingId(null);
    setMovieForm({ title: "", description: "", duration: "", genre: "", movieLanguage: "", poster: "" });
    setTheatreForm({ name: "", location: "", totalSeats: 100 });
    setShowForm({ movie: "", theatre: "", showTime: "", price: 200 });
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const handleMovieSubmit = async (e) => {
    e.preventDefault();
    try { if (editingId) await API.put("/movies/" + editingId, movieForm); else await API.post("/movies", movieForm); toast.success(editingId ? "Movie updated" : "Movie added"); closeModal(); fetchMovies(); }
    catch (err) { toast.error("Failed"); }
  };
  const handleTheatreSubmit = async (e) => {
    e.preventDefault();
    try { if (editingId) await API.put("/theatres/" + editingId, theatreForm); else await API.post("/theatres", theatreForm); toast.success(editingId ? "Theatre updated" : "Theatre added"); closeModal(); fetchTheatres(); }
    catch (err) { toast.error("Failed"); }
  };
  const handleShowSubmit = async (e) => {
    e.preventDefault();
    try { if (editingId) await API.put("/shows/" + editingId, showForm); else await API.post("/shows", showForm); toast.success(editingId ? "Show updated" : "Show added"); closeModal(); fetchShows(); }
    catch (err) { toast.error("Failed"); }
  };

  const deleteMovie = async (id) => { if (window.confirm("Delete movie?")) { try { await API.delete("/movies/" + id); toast.success("Deleted"); fetchMovies(); } catch (err) { toast.error("Failed"); } } };
  const deleteTheatre = async (id) => { if (window.confirm("Delete theatre?")) { try { await API.delete("/theatres/" + id); toast.success("Deleted"); fetchTheatres(); } catch (err) { toast.error("Failed"); } } };
  const deleteShow = async (id) => { if (window.confirm("Delete show?")) { try { await API.delete("/shows/" + id); toast.success("Deleted"); fetchShows(); } catch (err) { toast.error("Failed"); } } };

  const editMovie = (movie) => { setMovieForm({ title: movie.title, description: movie.description, duration: movie.duration, genre: movie.genre, movieLanguage: movie.movieLanguage, poster: movie.poster }); setEditingId(movie._id); setIsModalOpen(true); };
  const editTheatre = (theatre) => { setTheatreForm({ name: theatre.name, location: theatre.location, totalSeats: theatre.totalSeats }); setEditingId(theatre._id); setIsModalOpen(true); };
  const editShow = (show) => {
    if (!show?.movie?._id || !show?.theatre?._id) {
      toast.error("Cannot edit: missing movie or theatre data");
      return;
    }
    const showDate = new Date(show.showTime);
    setShowForm({
      movie: show.movie._id,
      theatre: show.theatre._id,
      showTime: showDate.toISOString().slice(0, 16),
      price: show.price,
    });
    setEditingId(show._id);
    setIsModalOpen(true);
  };

  const tabs = [
    { id: "movies", label: "Movies", icon: "\uD83C\uDFAC" },
    { id: "theatres", label: "Theatres", icon: "\uD83C\uDFE2" },
    { id: "shows", label: "Shows", icon: "\uD83C\uDF9F\uFE0F" },
  ];

  const TabButton = ({ tab }) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left font-medium ${activeTab === tab.id ? "bg-[#7a1c1c] text-white shadow-lg" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
    >
      <span className="text-xl">{tab.icon}</span>
      {tab.label}
    </button>
  );

  const MobileTabPill = ({ tab }) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeTab === tab.id ? "bg-[#7a1c1c] text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
    >
      <span>{tab.icon}</span>
      {tab.label}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#f5efe6] font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="w-64 bg-[#1a1614] text-white flex-col shadow-2xl z-20 hidden md:flex">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-black text-[#f5efe6] tracking-wider">TicketPeChalo.in</h1>
          <p className="text-xs text-gray-400 mt-1">Management Portal</p>
        </div>
        <div className="flex-1 px-4 py-6 space-y-2">{tabs.map((t) => <TabButton key={t.id} tab={t} />)}</div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileMenuOpen(false)}>
            <motion.div initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }} transition={{ duration: 0.2, ease: "easeOut" }} className="w-64 h-full bg-[#1a1614] text-white flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-black text-[#f5efe6] tracking-wider">TicketPeChalo.in</h1>
                  <p className="text-xs text-gray-400 mt-1">Management Portal</p>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
              </div>
              <div className="flex-1 px-4 py-6 space-y-2">
                {tabs.map((t) => (
                  <button key={t.id} onClick={() => { setActiveTab(t.id); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150 text-left font-medium ${activeTab === t.id ? "bg-[#7a1c1c] text-white shadow-lg" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
                    <span className="text-xl">{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <header className="bg-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 shadow-sm flex justify-between items-center z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition">
              <svg className="w-6 h-6 text-[#1a1614]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1a1614] capitalize border-l-4 border-[#7a1c1c] pl-3">Manage {activeTab}</h2>
          </div>
          <button onClick={openAddModal} className="bg-[#7a1c1c] hover:bg-[#5c1414] text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-md font-semibold transition-all shadow-md flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
            <span>+</span><span className="hidden sm:inline">Add New {activeTab.slice(0, -1)}</span><span className="sm:hidden">Add</span>
          </button>
        </header>

        {/* Mobile Tab Pills */}
        <div className="md:hidden bg-white border-b border-[#e2d6c8] px-4 py-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">{tabs.map((t) => <MobileTabPill key={t.id} tab={t} />)}</div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {activeTab === "movies" && (
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-[#e2d6c8] border-l-4 border-l-[#7a1c1c]">
                <p className="text-gray-500 text-xs sm:text-sm font-semibold uppercase">Total Movies</p>
                <h3 className="text-2xl sm:text-3xl font-black text-[#1a1614] mt-1">{movies.length}</h3>
              </div>
            )}
            {activeTab === "theatres" && (
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-[#e2d6c8] border-l-4 border-l-[#e67e22]">
                <p className="text-gray-500 text-xs sm:text-sm font-semibold uppercase">Total Theatres</p>
                <h3 className="text-2xl sm:text-3xl font-black text-[#1a1614] mt-1">{theatres.length}</h3>
              </div>
            )}
            {activeTab === "shows" && (
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-[#e2d6c8] border-l-4 border-l-[#2980b9]">
                <p className="text-gray-500 text-xs sm:text-sm font-semibold uppercase">Active Shows</p>
                <h3 className="text-2xl sm:text-3xl font-black text-[#1a1614] mt-1">{shows.length}</h3>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border border-[#e2d6c8] overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#faf7f2] text-gray-600 uppercase text-xs font-bold border-b border-[#e2d6c8]">
                    {activeTab === "movies" && <><th className="p-4">Movie</th><th className="p-4">Genre</th><th className="p-4">Language</th><th className="p-4 text-right">Actions</th></>}
                    {activeTab === "theatres" && <><th className="p-4">Theatre Name</th><th className="p-4">Location</th><th className="p-4">Total Seats</th><th className="p-4 text-right">Actions</th></>}
                    {activeTab === "shows" && <><th className="p-4">Movie</th><th className="p-4">Theatre</th><th className="p-4">Show Time</th><th className="p-4">Price</th><th className="p-4 text-right">Actions</th></>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2d6c8]">
                  {activeTab === "movies" && movies.map((m) => (
                    <tr key={m._id} className="hover:bg-[#faf7f2]/50 transition">
                      <td className="p-4 flex items-center gap-4">
                        <img src={m.poster} alt={m.title} className="w-12 h-16 object-cover rounded shadow-sm" />
                        <div><p className="font-bold text-[#1a1614]">{m.title}</p><p className="text-xs text-gray-500">{m.duration} mins</p></div>
                      </td>
                      <td className="p-4"><span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">{m.genre}</span></td>
                      <td className="p-4 font-medium text-gray-700">{m.movieLanguage}</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => editMovie(m)} className="text-blue-600 hover:text-blue-800 font-medium text-sm px-2">Edit</button>
                        <button onClick={() => deleteMovie(m._id)} className="text-red-600 hover:text-red-800 font-medium text-sm px-2">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {activeTab === "theatres" && theatres.map((t) => (
                    <tr key={t._id} className="hover:bg-[#faf7f2]/50 transition">
                      <td className="p-4 font-bold text-[#1a1614]">{t.name}</td>
                      <td className="p-4 text-gray-600">{t.location}</td>
                      <td className="p-4 font-medium text-gray-700">{t.totalSeats}</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => editTheatre(t)} className="text-blue-600 hover:text-blue-800 font-medium text-sm px-2">Edit</button>
                        <button onClick={() => deleteTheatre(t._id)} className="text-red-600 hover:text-red-800 font-medium text-sm px-2">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {activeTab === "shows" && shows.map((s) => (
                    <tr key={s._id} className="hover:bg-[#faf7f2]/50 transition">
                      <td className="p-4 font-bold text-[#1a1614]">{s.movie?.title || "Unknown"}</td>
                      <td className="p-4 text-gray-600">{s.theatre?.name || "Unknown"}</td>
                      <td className="p-4 font-medium text-gray-700">{new Date(s.showTime).toLocaleString()}</td>
                      <td className="p-4 font-bold text-[#7a1c1c]">₹{s.price}</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => editShow(s)} className="text-blue-600 hover:text-blue-800 font-medium text-sm px-2">Edit</button>
                        <button onClick={() => deleteShow(s._id)} className="text-red-600 hover:text-red-800 font-medium text-sm px-2">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              {activeTab === "movies" && movies.map((m) => (
                <div key={m._id} className="p-4 border-b border-[#e2d6c8] last:border-b-0">
                  <div className="flex gap-3">
                    <img src={m.poster} alt={m.title} className="w-14 h-20 object-cover rounded shadow-sm flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1a1614] text-sm truncate">{m.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{m.duration} mins</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">{m.genre}</span>
                        <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">{m.movieLanguage}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-3">
                    <button onClick={() => editMovie(m)} className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg text-xs font-semibold hover:bg-blue-100 transition">Edit</button>
                    <button onClick={() => deleteMovie(m._id)} className="flex-1 bg-red-50 text-red-700 py-2 rounded-lg text-xs font-semibold hover:bg-red-100 transition">Delete</button>
                  </div>
                </div>
              ))}
              {activeTab === "theatres" && theatres.map((t) => (
                <div key={t._id} className="p-4 border-b border-[#e2d6c8] last:border-b-0">
                  <p className="font-bold text-[#1a1614] text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.location}</p>
                  <p className="text-xs text-gray-600 mt-1">{t.totalSeats} seats</p>
                  <div className="flex gap-3 mt-3">
                    <button onClick={() => editTheatre(t)} className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg text-xs font-semibold hover:bg-blue-100 transition">Edit</button>
                    <button onClick={() => deleteTheatre(t._id)} className="flex-1 bg-red-50 text-red-700 py-2 rounded-lg text-xs font-semibold hover:bg-red-100 transition">Delete</button>
                  </div>
                </div>
              ))}
              {activeTab === "shows" && shows.map((s) => (
                <div key={s._id} className="p-4 border-b border-[#e2d6c8] last:border-b-0">
                  <p className="font-bold text-[#1a1614] text-sm">{s.movie?.title || "Unknown"}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.theatre?.name || "Unknown"}</p>
                  <p className="text-xs text-gray-600 mt-1">{new Date(s.showTime).toLocaleString()}</p>
                  <p className="text-xs font-bold text-[#7a1c1c] mt-1">₹{s.price}</p>
                  <div className="flex gap-3 mt-3">
                    <button onClick={() => editShow(s)} className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg text-xs font-semibold hover:bg-blue-100 transition">Edit</button>
                    <button onClick={() => deleteShow(s._id)} className="flex-1 bg-red-50 text-red-700 py-2 rounded-lg text-xs font-semibold hover:bg-red-100 transition">Delete</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty States */}
            {activeTab === "movies" && movies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-5xl mb-4">🎬</p>
                <p className="text-gray-800 font-semibold text-sm">No movies found</p>
                <p className="text-gray-500 text-xs mt-1">Click "Add New Movie" to get started</p>
              </div>
            )}
            {activeTab === "theatres" && theatres.length === 0 && (
              <div className="text-center py-12">
                <p className="text-5xl mb-4">🏢</p>
                <p className="text-gray-800 font-semibold text-sm">No theatres found</p>
                <p className="text-gray-500 text-xs mt-1">Click "Add New Theatre" to get started</p>
              </div>
            )}
            {activeTab === "shows" && shows.length === 0 && (
              <div className="text-center py-12">
                <p className="text-5xl mb-4">🎟️</p>
                <p className="text-gray-800 font-semibold text-sm">No shows found</p>
                <p className="text-gray-500 text-xs mt-1">Click "Add New Show" to schedule one</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[#e2d6c8]">
              <div className="flex justify-between items-center p-6 border-b border-[#e2d6c8] bg-[#faf7f2]">
                <h3 className="text-xl font-bold text-[#1a1614]">{editingId ? "Edit" : "Add New"} {activeTab.slice(0, -1)}</h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-red-600 font-bold text-xl">&times;</button>
              </div>
              <div className="p-6">
                {activeTab === "movies" && (
                  <form onSubmit={handleMovieSubmit} className="space-y-4">
                    <input type="text" placeholder="Movie Title" required value={movieForm.title} onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1c1c] outline-none transition" />
                    <textarea placeholder="Description" required rows={3} value={movieForm.description} onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1c1c] outline-none transition" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="number" placeholder="Duration (mins)" required value={movieForm.duration} onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]" />
                      <input type="text" placeholder="Genre" required value={movieForm.genre} onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="Language" required value={movieForm.movieLanguage} onChange={(e) => setMovieForm({ ...movieForm, movieLanguage: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]" />
                      <input type="url" placeholder="Poster Image URL" required value={movieForm.poster} onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#7a1c1c]" />
                    </div>
                    <button type="submit" className="w-full bg-[#7a1c1c] hover:bg-[#5c1414] text-white font-bold py-3 rounded-lg transition mt-4">{editingId ? "Update Movie" : "Save Movie"}</button>
                  </form>
                )}
                {activeTab === "theatres" && (
                  <form onSubmit={handleTheatreSubmit} className="space-y-4">
                    <input type="text" placeholder="Theatre Name" required value={theatreForm.name} onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1c1c] outline-none transition" />
                    <input type="text" placeholder="Location" required value={theatreForm.location} onChange={(e) => setTheatreForm({ ...theatreForm, location: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1c1c] outline-none transition" />
                    <input type="number" placeholder="Total Seats" required value={theatreForm.totalSeats} onChange={(e) => setTheatreForm({ ...theatreForm, totalSeats: parseInt(e.target.value) })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1c1c] outline-none transition" />
                    <button type="submit" className="w-full bg-[#7a1c1c] hover:bg-[#5c1414] text-white font-bold py-3 rounded-lg transition mt-4">{editingId ? "Update Theatre" : "Save Theatre"}</button>
                  </form>
                )}
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

