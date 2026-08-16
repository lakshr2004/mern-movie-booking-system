import { Link, useLocation } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Determine if currently on admin route
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <footer className="bg-[#140b0d] border-t border-[#3b121b] text-[#d4a5a5] py-6 px-4 sm:px-8 mt-auto z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard" className="text-xl font-black text-[#f8f3e9] tracking-wider hover:text-white transition">
              TicketPeChalo.in
            </Link>
            <span className="bg-[#8b1e3f]/30 border border-[#8b1e3f]/60 text-amber-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 bg-[#251016] border border-[#3b121b] px-3 py-1 rounded-full text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Systems Operational
            </span>
            <span className="text-[#a87878] font-mono">
              © {currentYear} TicketPeChalo Inc.
            </span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-[#18080c] text-[#f8f3e9] border-t border-[#3b121b] mt-16 relative overflow-hidden">
      {/* Decorative top ambient glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-[#8b1e3f] to-transparent shadow-[0_0_12px_#8b1e3f]" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12 text-center sm:text-left">
          
          {/* Brand & Overview */}
          <div className="space-y-4">
            <Link to="/" className="text-3xl sm:text-4xl font-black tracking-wider text-[#f8f3e9] inline-block hover:text-[#e7dac8] transition">
              TicketPeChalo<span className="text-[#8b1e3f]">.in</span>
            </Link>
            <p className="text-xs sm:text-sm text-[#d4a5a5] leading-relaxed max-w-sm mx-auto sm:mx-0">
              Book Movies • Reserve Seats • Experience Cinema. Your premier destination for instant online movie ticket bookings.
            </p>
            
            {/* Feature badges */}
            <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-1">
              {[
                { label: "Cinema", icon: "🎬" },
                { label: "Popcorn", icon: "🍿" },
                { label: "Tickets", icon: "🎟️" },
                { label: "Rating", icon: "⭐" },
              ].map((badge) => (
                <span
                  key={badge.label}
                  className="w-9 h-9 rounded-xl bg-[#2b0d15] border border-[#4d1624] flex items-center justify-center text-sm shadow-sm hover:bg-[#8b1e3f] hover:scale-105 transition-all cursor-default"
                  title={badge.label}
                >
                  {badge.icon}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-amber-200/90 border-b border-[#3b121b] pb-2 inline-block sm:block">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#d4a5a5]">
              <li>
                <Link to="/" className="hover:text-[#f8f3e9] transition flex items-center justify-center sm:justify-start gap-2 group">
                  <span className="text-[#8b1e3f] group-hover:translate-x-1 transition-transform">▸</span>
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-[#f8f3e9] transition flex items-center justify-center sm:justify-start gap-2 group">
                  <span className="text-[#8b1e3f] group-hover:translate-x-1 transition-transform">▸</span>
                  <span>All Movies</span>
                </Link>
              </li>
              {user && (
                <li>
                  <Link to="/my-bookings" className="hover:text-[#f8f3e9] transition flex items-center justify-center sm:justify-start gap-2 group">
                    <span className="text-[#8b1e3f] group-hover:translate-x-1 transition-transform">▸</span>
                    <span>My Bookings</span>
                  </Link>
                </li>
              )}
              <li>
                <Link to="/contact" className="hover:text-[#f8f3e9] transition flex items-center justify-center sm:justify-start gap-2 group">
                  <span className="text-[#8b1e3f] group-hover:translate-x-1 transition-transform">▸</span>
                  <span>Contact Support</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support Info */}
          <div className="space-y-4 sm:col-span-2 md:col-span-1">
            <h4 className="text-xs font-black uppercase tracking-widest text-amber-200/90 border-b border-[#3b121b] pb-2 inline-block sm:block">
              Connect & Support
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-[#d4a5a5]">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#2b0d15] border border-[#4d1624] flex items-center justify-center text-[#8b1e3f] shrink-0 font-bold">
                  ✉
                </span>
                <span>lakshr2004@gmail.com</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#2b0d15] border border-[#4d1624] flex items-center justify-center text-[#8b1e3f] shrink-0 font-bold">
                  📍
                </span>
                <span>Asansol, West Bengal, India</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#2b0d15] border border-[#4d1624] flex items-center justify-center text-[#8b1e3f] shrink-0 font-bold">
                  ⏰
                </span>
                <span>Mon - Sun: 9:00 AM - 11:00 PM</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#3b121b] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#a87878] text-center">
          <p>© {currentYear} TicketPeChalo.in. All rights reserved.</p>
          <p className="flex items-center justify-center gap-1">
            <span>Crafted with</span>
            <span className="text-[#8b1e3f] text-sm animate-pulse">♥</span>
            <span>for cinema lovers everywhere</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
