import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.user?.role === "admin";

  return (
    <footer className="bg-[#4a0e1f] border-t border-[#7a1c1c] mt-10 relative overflow-hidden">
      {/* Subtle decorative gradient orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-[#f5f2ee]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <Link to="/" className="text-4xl font-black text-[#f5f2ee] tracking-wider block mb-3 hover:text-[#faf7f2] transition-colors duration-200">
              TicketPeChalo.in
            </Link>
            <p className="text-sm text-[#d4a5a5] leading-relaxed">
              Book Movies • Reserve Seats • Enjoy Cinema
            </p>
            <div className="flex gap-3 mt-4">
              <span className="w-8 h-8 rounded-full bg-[#7a1c1c] flex items-center justify-center text-sm hover:bg-[#8b1e3f] hover:text-[#f8f3e9] transition-all duration-200 cursor-pointer">🎬</span>
              <span className="w-8 h-8 rounded-full bg-[#7a1c1c] flex items-center justify-center text-sm hover:bg-[#8b1e3f] hover:text-[#f8f3e9] transition-all duration-200 cursor-pointer">🍿</span>
              <span className="w-8 h-8 rounded-full bg-[#7a1c1c] flex items-center justify-center text-sm hover:bg-[#8b1e3f] hover:text-[#f8f3e9] transition-all duration-200 cursor-pointer">🎟️</span>
            </div>
          </div>

          {/* Contact */}
          {!isAdmin && (
            <div>
              <h4 className="text-xs font-bold text-[#f5f2ee] uppercase tracking-widest mb-4">Contact</h4>
              <div className="space-y-3">
                <p className="flex items-center gap-3 text-sm text-[#d4a5a5]">
                  <span className="w-8 h-8 rounded-lg bg-[#7a1c1c] flex items-center justify-center text-[#f5f2ee] text-xs">✉</span>
                  lakshr2004@gmail.com
                </p>
                <p className="flex items-center gap-3 text-sm text-[#d4a5a5]">
                  <span className="w-8 h-8 rounded-lg bg-[#7a1c1c] flex items-center justify-center text-[#f5f2ee] text-xs">📍</span>
                  Asansol, West Bengal
                </p>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className={isAdmin ? "md:col-span-2" : ""}>
            <h4 className="text-xs font-bold text-[#f5f2ee] uppercase tracking-widest mb-4">Quick Links</h4>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link to="/" className="text-sm text-[#d4a5a5] hover:text-[#faf7f2] transition-colors duration-200 relative group">
                Home
                <span className="absolute left-0 -bottom-0.5 w-0 h-[1.5px] bg-[#f5f2ee] transition-all duration-300 group-hover:w-full" />
              </Link>
              {!isAdmin && (
                <Link to="/contact" className="text-sm text-[#d4a5a5] hover:text-[#faf7f2] transition-colors duration-200 relative group">
                  Contact
                  <span className="absolute left-0 -bottom-0.5 w-0 h-[1.5px] bg-[#f5f2ee] transition-all duration-300 group-hover:w-full" />
                </Link>
              )}
              {user && (
                <Link to="/my-bookings" className="text-sm text-[#d4a5a5] hover:text-[#faf7f2] transition-colors duration-200 relative group">
                  My Bookings
                  <span className="absolute left-0 -bottom-0.5 w-0 h-[1.5px] bg-[#f5f2ee] transition-all duration-300 group-hover:w-full" />
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="text-sm text-[#d4a5a5] hover:text-[#faf7f2] transition-colors duration-200 relative group">
                  Admin Dashboard
                  <span className="absolute left-0 -bottom-0.5 w-0 h-[1.5px] bg-[#f5f2ee] transition-all duration-300 group-hover:w-full" />
                </Link>
              )}
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[#7a1c1c] flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[#b87a7a]">
            © {currentYear} TicketPeChalo.in — All rights reserved.
          </p>
          <p className="text-xs text-[#b87a7a]">
            Made with <span className="text-[#f5f2ee]">♥</span> for movie lovers
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

