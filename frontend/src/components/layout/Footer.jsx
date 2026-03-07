function Footer() {
  const currentYear = new Date().getFullYear();

  // Get user from localStorage to check if admin
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.user?.role === "admin";

  return (
    <footer className="bg-gradient-to-r from-[#3b0a14] via-[#7a1c2f] to-[#3b0a14] text-[#f5e6d3] mt-auto border-t border-[#5c1424]">
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* About Section - Always show */}
          <div className="text-center md:text-left">
            <h3 className="text-sm md:text-4xl font-bold mb-2 text-[#ffd9a0]">TicketPeChalo.in</h3>
            <p className="text-xs md:text-sm text-[#f5e6d3]/80">
              Book Movies • Reserve Seats • Enjoy Cinema
            </p>
          </div>

          {/* Contact Us Section - Only show for non-admin users */}
          {!isAdmin && (
            <div className="text-center">
              <div className="space-y-2 text-xs md:text-sm">
                <p className="flex items-center justify-center md:justify-start gap-2">
                  <span>📞</span> +91 9038138105
                </p>
                <p className="flex items-center justify-center md:justify-start gap-2">
                  <span>✉️</span> lakshr2004@gmail.com
                </p>
                <p className="flex items-center justify-center md:justify-start gap-2">
                  <span>📍</span> Asansol , West Bengal
                </p>
              </div>
            </div>
          )}

          {/* Links Section */}
          <div className="text-center md:text-right">
            <div className="flex flex-col gap-2 text-xs md:text-sm">
              <a href="/" className="hover:text-[#ffd9a0] transition">Home</a>
              {!isAdmin && (
                <a href="contact" className="hover:text-[#ffd9a0] transition">Contact Us</a>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#5c1424]/50 mt-6 pt-4 text-center">
          <p className="text-sm md:text-4xl">
            © {currentYear} TicketPeChalo.in
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

