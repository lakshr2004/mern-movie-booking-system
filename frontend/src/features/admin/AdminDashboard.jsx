import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import { toast } from "react-toastify";

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("movies");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Paginated Data States
  const [moviesData, setMoviesData] = useState({ movies: [], total: 0, page: 1, pages: 1 });
  const [bookingsData, setBookingsData] = useState({ bookings: [], total: 0, page: 1, pages: 1 });
  const [usersData, setUsersData] = useState({ users: [], total: 0, page: 1, pages: 1 });
  const [stats, setStats] = useState({ totalRevenue: 0, totalBookings: 0, confirmedBookingsCount: 0, totalUsers: 0, totalMovies: 0 });

  const [loading, setLoading] = useState(false);

  // Pagination Page Numbers
  const [moviePage, setMoviePage] = useState(1);
  const [bookingPage, setBookingPage] = useState(1);
  const [userPage, setUserPage] = useState(1);

  // Movie Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [movieForm, setMovieForm] = useState({
    title: "",
    description: "",
    duration: 120,
    genre: "Action",
    movieLanguage: "Hindi",
    poster: "",
    certificate: "UA",
    rating: 8.5,
  });

  // Fetch Movies (Paginated)
  const fetchMovies = async (page = 1) => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/movies?page=${page}&limit=10`);
      setMoviesData(res.data);
    } catch (err) {
      console.error("Fetch Admin Movies Error:", err);
      toast.error("Failed to load movies list");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Bookings (Paginated)
  const fetchBookings = async (page = 1) => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/bookings?page=${page}&limit=10`);
      setBookingsData(res.data);
    } catch (err) {
      console.error("Fetch Admin Bookings Error:", err);
      toast.error("Failed to load bookings list");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Users (Paginated)
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/users?page=${page}&limit=10`);
      setUsersData(res.data);
    } catch (err) {
      console.error("Fetch Admin Users Error:", err);
      toast.error("Failed to load users list");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Stats (Non-Paginated)
  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Fetch Admin Stats Error:", err);
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetches based on active section and page changes
  useEffect(() => {
    if (activeSection === "movies") fetchMovies(moviePage);
    else if (activeSection === "bookings") fetchBookings(bookingPage);
    else if (activeSection === "users") fetchUsers(userPage);
    else if (activeSection === "stats") fetchStats();
  }, [activeSection, moviePage, bookingPage, userPage]);

  // Modal Handlers
  const openAddModal = () => {
    setEditingId(null);
    setMovieForm({
      title: "",
      description: "",
      duration: 120,
      genre: "Action",
      movieLanguage: "Hindi",
      poster: "",
      certificate: "UA",
      rating: 8.5,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleMovieSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/admin/movies/${editingId}`, movieForm);
        toast.success("Movie updated successfully");
      } else {
        await API.post("/admin/movies", movieForm);
        toast.success("Movie created successfully");
      }
      closeModal();
      fetchMovies(moviePage);
    } catch (err) {
      console.error("Movie save error:", err);
      toast.error(err.response?.data?.message || "Failed to save movie");
    }
  };

  const editMovie = (movie) => {
    setMovieForm({
      title: movie.title || "",
      description: movie.description || movie.story || "",
      duration: movie.duration || 120,
      genre: movie.genre || "Action",
      movieLanguage: movie.movieLanguage || movie.language || "Hindi",
      poster: movie.poster || "",
      certificate: movie.certificate || "UA",
      rating: movie.rating || 8.5,
    });
    setEditingId(movie._id);
    setIsModalOpen(true);
  };

  const deleteMovie = async (id) => {
    if (window.confirm("Are you sure you want to delete this movie?")) {
      try {
        await API.delete(`/admin/movies/${id}`);
        toast.success("Movie deleted");
        fetchMovies(moviePage);
      } catch (err) {
        toast.error("Failed to delete movie");
      }
    }
  };

  const sections = [
    { id: "movies", label: "Movies (Manage)", icon: "🎬" },
    { id: "bookings", label: "Bookings", icon: "🎟️" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "stats", label: "Revenue / Stats", icon: "📊" }
  ];

  // Helper Pagination Component (Condensed on mobile, full on desktop)
  const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);

    return (
      <div className="flex items-center justify-between px-3.5 sm:px-6 py-3.5 border-t border-[#e7dac8] bg-[#faf7f2] gap-2">
        <span className="text-xs font-bold text-[#4b2e1e] shrink-0">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#e7dac8] bg-white text-xs font-bold text-[#5b0f1b] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#8b1e3f] hover:text-white transition cursor-pointer"
          >
            Prev
          </button>
          
          {/* Numeric Page Buttons - Shown only on sm and up */}
          <div className="hidden sm:flex items-center gap-1.5">
            {pages.map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currentPage === p
                    ? "bg-[#8b1e3f] text-white shadow-sm"
                    : "bg-white text-[#4b2e1e] border border-[#e7dac8] hover:bg-[#8b1e3f]/10"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#e7dac8] bg-white text-xs font-bold text-[#5b0f1b] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#8b1e3f] hover:text-white transition cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#f8f3e9] font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="w-64 bg-[#1a1614] text-white flex-col shadow-2xl z-20 hidden md:flex">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-black text-[#f5efe6] tracking-wider flex items-center gap-2">
            <span>🛡️</span> Admin Panel
          </h1>
          <p className="text-xs text-amber-200/80 mt-1 font-mono">
            TicketPeChalo Control
          </p>
        </div>
        <div className="flex-1 px-4 py-6 space-y-2">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-bold text-sm ${
                activeSection === sec.id
                  ? "bg-[#8b1e3f] text-white shadow-lg ring-1 ring-white/20"
                  : "text-gray-400 hover:bg-[#8b1e3f]/20 hover:text-white"
              }`}
            >
              <span className="text-lg">{sec.icon}</span>
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.2 }}
              className="w-64 h-full bg-[#1a1614] text-white flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <div>
                  <h1 className="text-lg font-black text-[#f5efe6]">
                    Admin Panel
                  </h1>
                  <p className="text-xs text-amber-200">TicketPeChalo</p>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-400 text-2xl font-bold"
                >
                  &times;
                </button>
              </div>
              <div className="flex-1 px-4 py-6 space-y-2">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveSection(sec.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold text-sm ${
                      activeSection === sec.id
                        ? "bg-[#8b1e3f] text-white"
                        : "text-gray-400 hover:bg-[#8b1e3f]/20"
                    }`}
                  >
                    <span className="text-lg">{sec.icon}</span>
                    {sec.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Header Bar */}
        <header className="bg-white border-b border-[#e7dac8] px-6 py-4 shadow-sm flex justify-between items-center z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-[#1a1614]"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-xl font-extrabold text-[#5b0f1b] border-l-4 border-[#8b1e3f] pl-3 capitalize flex items-center gap-2">
              <span>
                {sections.find((s) => s.id === activeSection)?.icon}
              </span>
              <span>{sections.find((s) => s.id === activeSection)?.label}</span>
            </h2>
          </div>

          {activeSection === "movies" && (
            <button
              onClick={openAddModal}
              className="bg-[#8b1e3f] hover:bg-[#5b0f1b] text-white px-4 py-2 rounded-xl font-extrabold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ Add New Movie</span>
            </button>
          )}
        </header>

        {/* Dynamic Section Content Area */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#8b1e3f]" />
            </div>
          )}

          {/* SECTION 1: MOVIES (MANAGE) */}
          {!loading && activeSection === "movies" && (
            <div className="bg-white rounded-2xl shadow-sm border border-[#e7dac8] overflow-hidden">
              {/* Desktop Table View (md and up) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#faf7f2] text-[#5b0f1b] uppercase text-xs font-black border-b border-[#e7dac8]">
                      <th className="p-4">Movie</th>
                      <th className="p-4">Genre</th>
                      <th className="p-4">Language</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7dac8]">
                    {moviesData.movies.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-gray-500 font-medium">
                          No movies found in this page.
                        </td>
                      </tr>
                    ) : (
                      moviesData.movies.map((m) => (
                        <tr key={m._id} className="hover:bg-[#faf7f2]/60 transition">
                          <td className="p-4 flex items-center gap-3">
                            <img
                              src={m.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80"}
                              alt={m.title}
                              className="w-10 h-14 object-cover rounded-lg shadow-sm shrink-0 border border-[#e7dac8]"
                            />
                            <div>
                              <p className="font-bold text-[#2e1c14] text-sm">{m.title}</p>
                              <p className="text-xs text-gray-500">{m.duration} mins • {m.certificate || "UA"}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="bg-[#f5efe6] text-[#8b1e3f] border border-[#e7dac8] px-2.5 py-1 rounded-full text-xs font-bold">
                              {m.genre || "Action"}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-xs text-[#4b2e1e]">
                            {m.movieLanguage || m.language || "Hindi"}
                          </td>
                          <td className="p-4 font-bold text-xs text-amber-600">
                            ★ {m.rating ? m.rating.toFixed(1) : "8.5"}
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => editMovie(m)}
                              className="text-[#8b1e3f] hover:text-[#5b0f1b] font-bold text-xs bg-[#f5efe6] px-3 py-1.5 rounded-lg border border-[#e7dac8] cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteMovie(m._id)}
                              className="text-red-700 hover:text-red-900 font-bold text-xs bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Card View (below md breakpoint) */}
              <div className="md:hidden divide-y divide-[#e7dac8]">
                {moviesData.movies.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 font-medium text-xs">
                    No movies found in this page.
                  </div>
                ) : (
                  moviesData.movies.map((m) => (
                    <div key={m._id} className="p-4 space-y-3 bg-white">
                      <div className="flex gap-3 items-start">
                        <img
                          src={m.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80"}
                          alt={m.title}
                          className="w-14 h-20 object-cover rounded-xl border border-[#e7dac8] shadow-sm shrink-0"
                        />
                        <div className="flex-1 space-y-1">
                          <h4 className="font-extrabold text-[#2e1c14] text-sm leading-tight">{m.title}</h4>
                          <p className="text-xs text-gray-500">{m.duration} mins • {m.certificate || "UA"}</p>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="bg-[#f5efe6] text-[#8b1e3f] border border-[#e7dac8] px-2 py-0.5 rounded-full text-[10px] font-bold">
                              {m.genre || "Action"}
                            </span>
                            <span className="text-xs font-bold text-amber-600">
                              ★ {m.rating ? m.rating.toFixed(1) : "8.5"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#e7dac8]/50">
                        <span className="text-xs font-semibold text-[#4b2e1e]">
                          Lang: {m.movieLanguage || m.language || "Hindi"}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editMovie(m)}
                            className="text-[#8b1e3f] font-bold text-xs bg-[#f5efe6] px-3 py-1.5 rounded-lg border border-[#e7dac8]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteMovie(m._id)}
                            className="text-red-700 font-bold text-xs bg-red-50 px-3 py-1.5 rounded-lg border border-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <PaginationControls
                currentPage={moviesData.page}
                totalPages={moviesData.pages}
                onPageChange={(p) => setMoviePage(p)}
              />
            </div>
          )}

          {/* SECTION 2: BOOKINGS */}
          {!loading && activeSection === "bookings" && (
            <div className="bg-white rounded-2xl shadow-sm border border-[#e7dac8] overflow-hidden">
              {/* Desktop Table View (md and up) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#faf7f2] text-[#5b0f1b] uppercase text-xs font-black border-b border-[#e7dac8]">
                      <th className="p-4">Booking ID</th>
                      <th className="p-4">User</th>
                      <th className="p-4">Movie</th>
                      <th className="p-4">Theatre</th>
                      <th className="p-4">Seats</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7dac8]">
                    {bookingsData.bookings.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="p-8 text-center text-gray-500 font-medium">
                          No bookings found in this page.
                        </td>
                      </tr>
                    ) : (
                      bookingsData.bookings.map((b) => (
                        <tr key={b._id} className="hover:bg-[#faf7f2]/60 transition text-xs">
                          <td className="p-4 font-mono font-bold text-gray-700">
                            {b._id.slice(-8).toUpperCase()}
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-[#2e1c14]">{b.user?.name || "Guest"}</p>
                            <p className="text-[11px] text-gray-500">{b.user?.email || "N/A"}</p>
                          </td>
                          <td className="p-4 font-bold text-[#8b1e3f]">
                            {b.movie?.title || "Movie"}
                          </td>
                          <td className="p-4 text-gray-700 font-medium">
                            {b.show?.theatre?.name || "Theatre"}
                          </td>
                          <td className="p-4 font-mono font-bold text-indigo-700">
                            {b.seats?.join(", ")}
                          </td>
                          <td className="p-4 font-extrabold text-[#5b0f1b]">
                            ₹{b.totalPrice}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                b.payment_status === "confirmed"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : b.payment_status === "pending"
                                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                                  : "bg-red-100 text-red-800 border border-red-300"
                              }`}
                            >
                              {b.payment_status}
                            </span>
                          </td>
                          <td className="p-4 text-gray-500 font-medium">
                            {new Date(b.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Card View (below md breakpoint) */}
              <div className="md:hidden divide-y divide-[#e7dac8]">
                {bookingsData.bookings.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 font-medium text-xs">
                    No bookings found in this page.
                  </div>
                ) : (
                  bookingsData.bookings.map((b) => (
                    <div key={b._id} className="p-4 space-y-2 bg-white text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono font-bold text-gray-500">#{b._id.slice(-8).toUpperCase()}</span>
                          <h4 className="font-extrabold text-[#8b1e3f] text-sm mt-0.5">{b.movie?.title || "Movie"}</h4>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            b.payment_status === "confirmed"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : b.payment_status === "pending"
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-red-100 text-red-800 border border-red-300"
                          }`}
                        >
                          {b.payment_status}
                        </span>
                      </div>
                      <div className="space-y-1 text-gray-600">
                        <p><span className="font-semibold text-gray-800">User:</span> {b.user?.name || "Guest"} ({b.user?.email || "N/A"})</p>
                        <p><span className="font-semibold text-gray-800">Theatre:</span> {b.show?.theatre?.name || "Cinema Venue"}</p>
                        <p><span className="font-semibold text-gray-800">Seats:</span> <span className="font-mono font-bold text-indigo-700">{b.seats?.join(", ")}</span></p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-[#e7dac8]/50">
                        <span className="text-[11px] text-gray-500">
                          {new Date(b.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                        </span>
                        <span className="font-extrabold text-[#5b0f1b] text-sm">₹{b.totalPrice}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <PaginationControls
                currentPage={bookingsData.page}
                totalPages={bookingsData.pages}
                onPageChange={(p) => setBookingPage(p)}
              />
            </div>
          )}

          {/* SECTION 3: USERS */}
          {!loading && activeSection === "users" && (
            <div className="bg-white rounded-2xl shadow-sm border border-[#e7dac8] overflow-hidden">
              {/* Desktop Table View (md and up) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#faf7f2] text-[#5b0f1b] uppercase text-xs font-black border-b border-[#e7dac8]">
                      <th className="p-4">User</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7dac8]">
                    {usersData.users.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-gray-500 font-medium">
                          No users found in this page.
                        </td>
                      </tr>
                    ) : (
                      usersData.users.map((u) => (
                        <tr key={u._id} className="hover:bg-[#faf7f2]/60 transition text-xs">
                          <td className="p-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#8b1e3f] text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-[#2e1c14]">{u.name}</span>
                          </td>
                          <td className="p-4 text-gray-600 font-medium">{u.email}</td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                u.role === "admin"
                                  ? "bg-purple-100 text-purple-900 border border-purple-300"
                                  : "bg-gray-100 text-gray-700 border border-gray-300"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4 text-gray-500 font-medium">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Card View (below md breakpoint) */}
              <div className="md:hidden divide-y divide-[#e7dac8]">
                {usersData.users.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 font-medium text-xs">
                    No users found in this page.
                  </div>
                ) : (
                  usersData.users.map((u) => (
                    <div key={u._id} className="p-4 flex items-center justify-between bg-white text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#8b1e3f] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-extrabold text-[#2e1c14] text-sm">{u.name}</p>
                          <p className="text-gray-500 text-[11px]">{u.email}</p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase inline-block ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-900 border border-purple-300"
                              : "bg-gray-100 text-gray-700 border border-gray-300"
                          }`}
                        >
                          {u.role}
                        </span>
                        <p className="text-[10px] text-gray-400 font-medium">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <PaginationControls
                currentPage={usersData.page}
                totalPages={usersData.pages}
                onPageChange={(p) => setUserPage(p)}
              />
            </div>
          )}

          {/* SECTION 4: REVENUE / STATS */}
          {!loading && activeSection === "stats" && (
            <div className="space-y-6">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e7dac8] border-l-4 border-l-emerald-600 space-y-1">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Total Revenue
                  </p>
                  <h3 className="text-3xl font-black text-[#5b0f1b]">
                    ₹{stats.totalRevenue ? stats.totalRevenue.toLocaleString() : "0"}
                  </h3>
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    From confirmed bookings
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e7dac8] border-l-4 border-l-[#8b1e3f] space-y-1">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Total Bookings
                  </p>
                  <h3 className="text-3xl font-black text-[#1a1614]">
                    {stats.totalBookings || 0}
                  </h3>
                  <p className="text-[11px] text-[#8b1e3f] font-semibold">
                    {stats.confirmedBookingsCount || 0} Confirmed
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e7dac8] border-l-4 border-l-indigo-600 space-y-1">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Total Users
                  </p>
                  <h3 className="text-3xl font-black text-[#1a1614]">
                    {stats.totalUsers || 0}
                  </h3>
                  <p className="text-[11px] text-indigo-700 font-semibold">
                    Registered accounts
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e7dac8] border-l-4 border-l-amber-500 space-y-1">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Active Movies
                  </p>
                  <h3 className="text-3xl font-black text-[#1a1614]">
                    {stats.totalMovies || 0}
                  </h3>
                  <p className="text-[11px] text-amber-700 font-semibold">
                    Movies in database
                  </p>
                </div>
              </div>

              {/* Summary Overview Panel */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e7dac8] space-y-4">
                <h3 className="text-lg font-black text-[#5b0f1b] flex items-center gap-2">
                  <span>📊</span> Platform Operational Summary
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#faf7f2] border border-[#e7dac8] p-4 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-[#8b1e3f]">
                      CONVERSION METRIC
                    </div>
                    <div className="text-2xl font-black text-[#2e1c14]">
                      {stats.totalBookings > 0
                        ? ((stats.confirmedBookingsCount / stats.totalBookings) * 100).toFixed(1)
                        : "0.0"}%
                    </div>
                    <p className="text-xs text-gray-600 font-medium">
                      Booking completion rate (Confirmed vs Pending/Failed)
                    </p>
                  </div>

                  <div className="bg-[#faf7f2] border border-[#e7dac8] p-4 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-[#8b1e3f]">
                      AVERAGE REVENUE PER CONFIRMED BOOKING
                    </div>
                    <div className="text-2xl font-black text-[#2e1c14]">
                      ₹
                      {stats.confirmedBookingsCount > 0
                        ? Math.round(stats.totalRevenue / stats.confirmedBookingsCount)
                        : 0}
                    </div>
                    <p className="text-xs text-gray-600 font-medium">
                      Average order transaction value
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Movie Modal */}
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
              className="bg-[#faf7f2] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[#e7dac8]"
            >
              <div className="flex justify-between items-center p-6 border-b border-[#e7dac8] bg-white sticky top-0 z-10">
                <h3 className="text-xl font-bold text-[#5b0f1b]">
                  {editingId ? "Edit Movie" : "Add New Movie"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-[#5b0f1b] font-bold text-xl cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleMovieSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#4b2e1e] mb-1 block">Title</label>
                  <input
                    type="text"
                    required
                    value={movieForm.title}
                    onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                    className="w-full p-3 border border-[#e7dac8] rounded-xl focus:ring-2 focus:ring-[#8b1e3f] outline-none bg-white text-sm text-[#2e1c14]"
                    placeholder="e.g. Jawan"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#4b2e1e] mb-1 block">Story / Description</label>
                  <textarea
                    required
                    rows={3}
                    value={movieForm.description}
                    onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                    className="w-full p-3 border border-[#e7dac8] rounded-xl focus:ring-2 focus:ring-[#8b1e3f] outline-none bg-white text-sm text-[#2e1c14]"
                    placeholder="Enter movie storyline..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#4b2e1e] mb-1 block">Duration (mins)</label>
                    <input
                      type="number"
                      required
                      value={movieForm.duration}
                      onChange={(e) => setMovieForm({ ...movieForm, duration: parseInt(e.target.value) })}
                      className="w-full p-3 border border-[#e7dac8] rounded-xl outline-none focus:ring-2 focus:ring-[#8b1e3f] bg-white text-sm text-[#2e1c14]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#4b2e1e] mb-1 block">Genre</label>
                    <input
                      type="text"
                      required
                      value={movieForm.genre}
                      onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                      className="w-full p-3 border border-[#e7dac8] rounded-xl outline-none focus:ring-2 focus:ring-[#8b1e3f] bg-white text-sm text-[#2e1c14]"
                      placeholder="e.g. Action / Thriller"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#4b2e1e] mb-1 block">Language</label>
                    <input
                      type="text"
                      required
                      value={movieForm.movieLanguage}
                      onChange={(e) => setMovieForm({ ...movieForm, movieLanguage: e.target.value })}
                      className="w-full p-3 border border-[#e7dac8] rounded-xl outline-none focus:ring-2 focus:ring-[#8b1e3f] bg-white text-sm text-[#2e1c14]"
                      placeholder="e.g. Hindi"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#4b2e1e] mb-1 block">Rating (0 - 10)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={movieForm.rating}
                      onChange={(e) => setMovieForm({ ...movieForm, rating: parseFloat(e.target.value) })}
                      className="w-full p-3 border border-[#e7dac8] rounded-xl outline-none focus:ring-2 focus:ring-[#8b1e3f] bg-white text-sm text-[#2e1c14]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#4b2e1e] mb-1 block">Poster Image URL</label>
                  <input
                    type="url"
                    required
                    value={movieForm.poster}
                    onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })}
                    className="w-full p-3 border border-[#e7dac8] rounded-xl outline-none focus:ring-2 focus:ring-[#8b1e3f] bg-white text-sm text-[#2e1c14]"
                    placeholder="https://..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#8b1e3f] hover:bg-[#5b0f1b] text-white font-extrabold py-3.5 rounded-xl transition shadow-md mt-4 cursor-pointer text-sm"
                >
                  {editingId ? "Update Movie" : "Save Movie"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminDashboard;
