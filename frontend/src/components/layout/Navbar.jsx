import { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../features/auth/AuthContext";
import logo from "../../assets/logo.jpeg";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const navbarRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

  const handleLogout = () => { logout(); navigate("/"); setIsMenuOpen(false); };
  const handleMyBookings = () => { navigate(user ? "/my-bookings" : "/register"); setIsMenuOpen(false); };

  const isAdmin = user?.user?.role === "admin";

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
                    style={{ color: "#6b4430", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#8b1e3f")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#6b4430")}
                  >
                    Contact
                  </Link>
                  <button
                    onClick={handleMyBookings}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#6b4430", fontSize: 14, fontWeight: 500, padding: 0 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#8b1e3f")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#6b4430")}
                  >
                    My Bookings
                  </button>
                </>
              )}

              {isAdmin && (
                <div style={{ display: "flex", gap: 20, borderLeft: "1px solid rgba(75,46,30,0.15)", paddingLeft: 20 }}>
                  {[
                    { label: "Movies", href: "/admin?tab=movies" },
                    { label: "Theatres", href: "/admin?tab=theatres" },
                    { label: "Shows", href: "/admin?tab=shows" },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      style={{ color: "#6b4430", textDecoration: "none", fontSize: 14, fontWeight: 500 }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#8b1e3f")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#6b4430")}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Auth — desktop */}
            <div className="hidden md:flex" style={{ alignItems: "center", gap: 10 }}>
              {user ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(122,74,42,0.08)", borderRadius: 30, padding: "5px 14px 5px 6px" }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#7a4a2a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>
                      {user.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#4b2e1e" }}>
                      {user.user?.name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{ background: "#8b0000", color: "#fff", border: "none", cursor: "pointer", padding: "7px 18px", fontSize: 13, fontWeight: 600, borderRadius: isScrolled ? 30 : 8, transition: "border-radius 0.35s cubic-bezier(0.4,0,0.2,1)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#a52a2a")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#8b0000")}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    style={{ color: "#4b2e1e", fontWeight: 600, fontSize: 13, textDecoration: "none", padding: "7px 14px", border: "1px solid rgba(75,46,30,0.22)", borderRadius: isScrolled ? 30 : 8, transition: "border-radius 0.35s cubic-bezier(0.4,0,0.2,1)" }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    style={{ background: "#7a4a2a", color: "#fff", fontWeight: 600, fontSize: 13, textDecoration: "none", padding: "7px 18px", borderRadius: isScrolled ? 30 : 8, transition: "border-radius 0.35s cubic-bezier(0.4,0,0.2,1)" }}
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
                      background: "#4b2e1e", borderRadius: 2,
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
          <div style={{ margin: "0 12px 12px", padding: 16, background: "rgba(255,252,248,0.9)", borderRadius: 16, border: "1px solid rgba(139,30,63,0.1)", display: "flex", flexDirection: "column", gap: 2 }}>
            {!isAdmin && (
              <>
                <Link
                  to="/contact"
                  onClick={() => setIsMenuOpen(false)}
                  style={{ padding: "12px 4px", fontSize: 15, fontWeight: 500, color: "#4b2e1e", textDecoration: "none", borderBottom: "1px solid rgba(75,46,30,0.08)" }}
                >
                  Contact
                </Link>
                <button
                  onClick={handleMyBookings}
                  style={{ padding: "12px 4px", textAlign: "left", fontSize: 15, fontWeight: 500, color: "#4b2e1e", background: "none", border: "none", borderBottom: "1px solid rgba(75,46,30,0.08)", cursor: "pointer" }}
                >
                  My Bookings
                </button>
              </>
            )}
            {!user ? (
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 10, border: "1px solid rgba(75,46,30,0.25)", color: "#4b2e1e", fontWeight: 600, fontSize: 14, textDecoration: "none" }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 10, background: "#7a4a2a", color: "#fff", fontWeight: 600, fontSize: 14, textDecoration: "none" }}
                >
                  Register
                </Link>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                style={{ marginTop: 8, padding: "10px 0", borderRadius: 10, background: "#8b0000", color: "#fff", fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}
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