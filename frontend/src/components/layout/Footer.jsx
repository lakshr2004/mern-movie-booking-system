function Footer() {
  const currentYear = new Date().getFullYear();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.user?.role === "admin";

  return (
    <footer className="bg-gradient-to-r from-[#7a4a2a] via-[#8b1e3f] to-[#7a4a2a] text-[#f5e6d3] border-t border-[#5c1424] mt-10">

      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-[#ffd9a0] mb-2">
              TicketPeChalo.in
            </h3>
            <p className="text-sm opacity-80">
              Book Movies • Reserve Seats • Enjoy Cinema
            </p>
          </div>

          {/* Contact */}
          {!isAdmin && (
            <div className="text-sm space-y-2">
              <p>📞 +91 9038138105</p>
              <p>✉️ lakshr2004@gmail.com</p>
              <p>📍 Asansol, West Bengal</p>
            </div>
          )}

          {/* Links */}
          <div className="text-sm md:text-right space-y-2">
            <a href="/" className="block hover:text-[#ffd9a0]">Home</a>
            {!isAdmin && (
              <a href="/contact" className="block hover:text-[#ffd9a0]">
                Contact
              </a>
            )}
          </div>

        </div>

        <div className="border-t border-[#5c1424]/40 mt-8 pt-4 text-center text-xs">
          © {currentYear} TicketPeChalo.in
        </div>

      </div>

    </footer>
  );
}

export default Footer;
