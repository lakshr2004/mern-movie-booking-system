import { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../features/auth/AuthContext";
import logo from "../../assets/logo.jpeg";

function Navbar() {
  const { user, logout, getUserRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const navbarRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMenuOpen && navbarRef.current && !navbarRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = () => { logout(); navigate("/login"); setIsMenuOpen(false); };
  const handleMyBookings = () => { navigate(user ? "/my-bookings" : "/register"); setIsMenuOpen(false); };

  const isAdmin = getUserRole() === "admin";

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        padding: isScrolled ? "10px 16px" : "0",
        transition: "padding 0.35s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents: "none",
      }}
    >
      <nav
        ref={navbarRef}
        style={{
          pointerEvents: "all",
          background: "rgba(255, 248, 242, 0.78)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderRadius: isScrolled ? "60px" : "0px",
          border: isScrolled ? "1px solid rgba(139, 30, 63, 0.18)" : "none",
          borderBottom: isScrolled ? "none" : "1px solid rgba(139, 30, 63, 0.1)",
          boxShadow: isScrolled ? "0 8px 32px rgba(122, 74, 42, 0.13)" : "none",
          transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: isScrolled ? "none" : "80rem",
            margin: "0 auto",
            padding: isScrolled ? "0 24px" : "0 32px",
            transition: "padding 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: isScrolled ? "54px" : "72px",
              transition: "height 0.35s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {/* Logo */}
            <Link to="/" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <img
                src={logo}
                alt="TicketPeChalo Logo"
                style={{
                  height: isScrolled ? "36px" : "52px",
                  width: "auto",
                  objectFit: "contain",
                  transition: "height 0.35s cubic-bezier(0.4,0,0.2,1)",
                  borderRadius: isScrolled ? "50%" : "6px",
                }}
              />
            </Link>

            {/* Desktop links */}
            <div
              className="hidden md:flex"
              style={{ alignItems: "center", gap: 28, fontWeight: 500, fontSize: 14 }}
            >
              {!isAdmin && (
                <>
                  <Link
                    to="/contact"
                    style={{ 
                      color: isActive("/contact") ? "#8b1e3f" : "#4b2e1e", 
                      textDecoration: "none",
                      borderBottom: isActive("/contact") ? "2px solid #8b1e3f" : "2px solid transparent",
                      paddingBottom: 2,
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#8b1e3f")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = isActive("/contact") ? "#8b1e3f" : "#4b2e1e")}
                  >
                    Contact
                  </Link>
                  {user && (
                    <button
                      onClick={handleMyBookings}
                      style={{ background: "none", border: "none", cursor: "pointer", color: isActive("/my-bookings") ? "#8b1e3f" : "#4b2e1e", fontSize: 14, fontWeight: 500, padding: 0 }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#8b1e3f")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = isActive("/my-bookings") ? "#8b1e3f" : "#4b2e1e")}
                    >
                      My Bookings
                    </button>
                  )}
                </>
              )}
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  style={{ 
                    color: isActive("/admin/dashboard") || isActive("/admin") ? "#8b1e3f" : "#4b2e1e", 
                    textDecoration: "none",
                    borderBottom: isActive("/admin/dashboard") || isActive("/admin") ? "2px solid #8b1e3f" : "2px solid transparent",
                    paddingBottom: 2,
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#8b1e3f")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = (isActive("/admin/dashboard") || isActive("/admin")) ? "#8b1e3f" : "#4b2e1e")}
                >
                  Admin Dashboard
                </Link>
              )}
            </div>

            {/* Auth — desktop */}
            <div className="hidden md:flex" style={{ alignItems: "center", gap: 10 }}>
              {user ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(139,30,63,0.08)", borderRadius: 30, padding: "5px 14px 5px 6px" }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#8b1e3f", display: "flex", alignItems: "center", justifyContent: "center", color: "#f8f3e9", fontSize: 13, fontWeight: 700 }}>
                      {user.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#2e1c14" }}>
                      {user.user?.name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{ background: "#8b1e3f", color: "#fff", border: "none", cursor: "pointer", padding: "7px 18px", fontSize: 13, fontWeight: 600, borderRadius: isScrolled ? 30 : 8, transition: "all 0.2s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#5b0f1b")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#8b1e3f")}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    style={{ color: "#2e1c14", fontWeight: 600, fontSize: 13, textDecoration: "none", padding: "7px 14px", border: "1px solid rgba(139,30,63,0.22)", borderRadius: isScrolled ? 30 : 8, transition: "all 0.2s ease" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#8b1e3f";
                      e.currentTarget.style.borderColor = "#8b1e3f";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#2e1c14";
                      e.currentTarget.style.borderColor = "rgba(139,30,63,0.22)";
                    }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    style={{ background: "#8b1e3f", color: "#fff", fontWeight: 600, fontSize: 13, textDecoration: "none", padding: "7px 18px", borderRadius: isScrolled ? 30 : 8, transition: "all 0.2s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#5b0f1b")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#8b1e3f")}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Hamburger */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}
            >
              <div style={{ width: 22, height: 18, position: "relative" }}>
                {[0, 8, 16].map((top, i) => (
                  <span
                    key={i}
                    style={{
                      position: "absolute", left: 0, width: 22, height: 2,
                      background: "#8b1e3f", borderRadius: 2,
                      top: isMenuOpen ? 8 : top,
                      transform: isMenuOpen
                        ? (i === 0 ? "rotate(45deg)" : i === 2 ? "rotate(-45deg)" : "none")
                        : "none",
                      opacity: isMenuOpen && i === 1 ? 0 : 1,
                      transition: "all 0.25s ease",
                    }}
                  />
                ))}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className="md:hidden"
          style={{
            maxHeight: isMenuOpen ? 400 : 0,
            opacity: isMenuOpen ? 1 : 0,
            overflow: "hidden",
            transition: "max-height 0.3s ease, opacity 0.2s ease",
          }}
        >
          <div style={{ margin: "0 12px 12px", padding: 16, background: "#f8f3e9", borderRadius: 16, border: "1px solid #e7dac8", display: "flex", flexDirection: "column", gap: 2 }}>
            {!isAdmin && (
              <>
                <Link
                  to="/contact"
                  onClick={() => setIsMenuOpen(false)}
                  style={{ padding: "12px 4px", fontSize: 15, fontWeight: 500, color: "#2e1c14", textDecoration: "none", borderBottom: "1px solid #e7dac8" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#8b1e3f")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#2e1c14")}
                >
                  Contact
                </Link>
                {user && (
                  <button
                    onClick={handleMyBookings}
                    style={{ padding: "12px 4px", textAlign: "left", fontSize: 15, fontWeight: 500, color: "#2e1c14", background: "none", border: "none", borderBottom: "1px solid #e7dac8", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#8b1e3f")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#2e1c14")}
                  >
                    My Bookings
                  </button>
                )}
              </>
            )}
            {isAdmin && (
              <div style={{ borderTop: "1px solid #e7dac8", paddingTop: 12, marginTop: 8 }}>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  style={{ 
                    display: "block", 
                    padding: "12px 4px", 
                    fontSize: 15, 
                    fontWeight: 500, 
                    color: "#2e1c14", 
                    textDecoration: "none", 
                    borderBottom: "1px solid #e7dac8" 
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#8b1e3f")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#2e1c14")}
                >
                  Admin Dashboard
                </Link>
              </div>
            )}
            {!user ? (
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 10, border: "1px solid #e7dac8", color: "#2e1c14", fontWeight: 600, fontSize: 14, textDecoration: "none" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#8b1e3f";
                    e.currentTarget.style.color = "#8b1e3f";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e7dac8";
                    e.currentTarget.style.color = "#2e1c14";
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 10, background: "#8b1e3f", color: "#fff", fontWeight: 600, fontSize: 14, textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#5b0f1b")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#8b1e3f")}
                >
                  Register
                </Link>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                style={{ marginTop: 8, padding: "10px 0", borderRadius: 10, background: "#8b1e3f", color: "#fff", fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer", transition: "all 0.2s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#5b0f1b")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#8b1e3f")}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;