import { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../features/auth/AuthContext";
import logo from "../../assets/logo.jpeg";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const navbarRef = useRef(null);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMenuOpen(false);
  };

  const handleMyBookings = () => {
    if (user) {
      navigate("/my-bookings");
    } else {
      navigate("/register");
    }
    setIsMenuOpen(false);
  };

  return (
    <nav ref={navbarRef} className="sticky top-0 z-50 w-full bg-[#f5efe2] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center">
            <img 
              src={logo} 
              alt="TicketPeChalo Logo" 
              className="h-14 md:h-16 lg:h-20 w-auto object-contain" 
            />
          </Link>

          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            {(!user || user.user?.role !== "admin") && (
              <>
                <Link 
                  to="/contact" 
                  className="px-3 lg:px-4 py-2 text-sm lg:text-base text-[#4b2e1e] hover:text-[#2b160d] font-semibold rounded-lg hover:bg-[#e6dccb]/60 transition-all duration-300 border border-[#d6c9b7]"
                >
                  Contact Us
                </Link>
                
                <button 
                  onClick={handleMyBookings} 
                  className="px-3 lg:px-4 py-2 text-sm lg:text-base text-[#4b2e1e] hover:text-[#2b160d] font-semibold rounded-lg hover:bg-[#e6dccb]/60 transition-all duration-300 border border-[#d6c9b7]"
                >
                  My Bookings
                </button>
              </>
            )}

            {user && user.user?.role === "admin" && (
              <div className="flex items-center gap-1 lg:gap-2 ml-2 pl-3 border-l border-[#d6c9b7]">
                <Link 
                  to="/admin?tab=movies" 
                  className="bg-[#8b1e3f] hover:bg-[#a52a4f] text-white px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  Movies
                </Link>
                <Link 
                  to="/admin?tab=theatres" 
                  className="bg-[#6b3e26] hover:bg-[#8b5a3c] text-white px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  Theatres
                </Link>
                <Link 
                  to="/admin?tab=shows" 
                  className="bg-[#4a2e1e] hover:bg-[#6b4532] text-white px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  Shows
                </Link>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 bg-[#e6dccb] px-3 py-1.5 rounded-xl border border-[#d6c9b7] shadow-sm">
                  <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-[#7a4a2a] flex items-center justify-center text-white font-bold text-xs lg:text-sm">
                    {user.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[#4b2e1e] text-xs lg:text-sm font-semibold">{user.user?.name}</span>
                  <span className={`px-1.5 py-0.5 text-[10px] lg:text-xs rounded-full font-semibold ${user.user?.role === "admin" ? "bg-[#7a4a2a]" : "bg-[#a0522d]"} text-white`}>
                    {user.user?.role}
                  </span>
                </div>
                
                <button 
                  onClick={handleLogout} 
                  className="bg-[#8b0000] hover:bg-[#a52a2a] text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-semibold shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="px-3 lg:px-4 py-1.5 lg:py-2 text-sm text-[#4b2e1e] hover:text-[#2b160d] font-semibold rounded-lg hover:bg-[#e6dccb]/60 transition-all duration-300 border border-[#d6c9b7]"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-[#7a4a2a] hover:bg-[#5e351c] text-white px-3 lg:px-5 py-1.5 lg:py-2 rounded-lg text-sm font-semibold shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <button 
            className="md:hidden p-2 rounded-lg hover:bg-[#e6dccb]/50 transition-all duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="w-6 h-6 relative">
              <span className={`absolute left-0 w-6 h-0.5 bg-[#4b2e1e] transition-all duration-300 ${isMenuOpen ? "top-3 rotate-45" : "top-1"}`}></span>
              <span className={`absolute left-0 top-3 w-6 h-0.5 bg-[#4b2e1e] transition-all duration-300 ${isMenuOpen ? "opacity-0" : "opacity-100"}`}></span>
              <span className={`absolute left-0 w-6 h-0.5 bg-[#4b2e1e] transition-all duration-300 ${isMenuOpen ? "top-3 -rotate-45" : "top-5"}`}></span>
            </div>
          </button>
        </div>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="bg-[#e6dccb]/50 border-t border-[#d6c9b7] mx-4 mb-4 rounded-2xl p-4 shadow-lg">
          <div className="flex flex-col gap-3">
            {(!user || user.user?.role !== "admin") && (
              <>
                <Link 
                  to="/contact" 
                  className="px-4 py-3 text-[#4b2e1e] font-semibold rounded-xl hover:bg-[#e6dccb]/70 transition-all duration-300 border border-[#d6c9b7]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact Us
                </Link>
                
                <button 
                  onClick={handleMyBookings} 
                  className="px-4 py-3 text-[#4b2e1e] font-semibold rounded-xl hover:bg-[#e6dccb]/70 transition-all duration-300 border border-[#d6c9b7] text-left"
                >
                  My Bookings
                </button>
              </>
            )}

            {user ? (
              <>
                {user.user?.role === "admin" && (
                  <div className="py-3 border-t border-b border-[#d6c9b7]">
                    <div className="flex flex-wrap gap-2">
                      <Link 
                        to="/admin?tab=movies" 
                        className="flex-1 bg-[#8b1e3f] hover:bg-[#a52a4f] text-white px-3 py-3 rounded-xl text-sm font-semibold text-center transition-all duration-300 hover:shadow-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Movies
                      </Link>
                      <Link 
                        to="/admin?tab=theatres" 
                        className="flex-1 bg-[#6b3e26] hover:bg-[#8b5a3c] text-white px-3 py-3 rounded-xl text-sm font-semibold text-center transition-all duration-300 hover:shadow-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Theatres
                      </Link>
                      <Link 
                        to="/admin?tab=shows" 
                        className="flex-1 bg-[#4a2e1e] hover:bg-[#6b4532] text-white px-3 py-3 rounded-xl text-sm font-semibold text-center transition-all duration-300 hover:shadow-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Shows
                      </Link>
                    </div>
                  </div>
                )}

                <div className="py-3 border-t border-b border-[#d6c9b7]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#7a4a2a] flex items-center justify-center text-white font-bold text-base">
                      {user.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#4b2e1e] font-bold">{user.user?.name}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full font-semibold w-fit ${user.user?.role === "admin" ? "bg-[#7a4a2a]" : "bg-[#a0522d]"} text-white`}>
                        {user.user?.role}
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleLogout} 
                  className="bg-[#8b0000] hover:bg-[#a52a2a] text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-3 border-t border-[#d6c9b7]">
                <Link 
                  to="/login" 
                  className="px-4 py-3 text-[#4b2e1e] font-semibold rounded-xl hover:bg-[#e6dccb]/70 transition-all duration-300 border border-[#d6c9b7] text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-[#7a4a2a] hover:bg-[#5e351c] text-white px-4 py-3 rounded-xl text-sm font-semibold text-center transition-all duration-300 hover:shadow-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

