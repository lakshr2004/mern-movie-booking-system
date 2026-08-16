import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function TheatreList({ theatres, selectedTime }) {
  const navigate = useNavigate();

  if (!theatres || theatres.length === 0) {
    return (
      <div className="bg-[#faf7f2] border border-[#e7dac8] rounded-xl p-8 text-center text-[#4b2e1e]">
        No theatres available for this showtime.
      </div>
    );
  }

  const handleSelectSeats = (theatre) => {
    if (theatre.showId) {
      navigate(`/seat/${theatre.showId}`);
    } else {
      // Fallback if navigating via custom object
      navigate(`/shows`);
    }
  };

  return (
    <div className="space-y-4 my-6">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-bold text-[#2e1c14] flex items-center gap-2">
          <svg className="w-5 h-5 text-[#8b1e3f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Showing {theatres.length} Theatres for <span className="text-[#8b1e3f] underline decoration-wavy decoration-[#8b1e3f]/40">{selectedTime}</span>
        </h4>
        <span className="text-xs text-[#4b2e1e] font-medium hidden sm:inline">
          Prices starting at ₹{Math.min(...theatres.map(t => t.price || 200))}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {theatres.map((t, idx) => (
          <Motion.div
            key={t.showId || t.name + idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.04 }}
            className="bg-[#faf7f2] border border-[#e7dac8] hover:border-[#8b1e3f] rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h5 className="font-bold text-[#5b0f1b] text-base leading-tight">
                    {t.name}
                  </h5>
                  <p className="text-xs text-[#4b2e1e] flex items-center gap-1 mt-1">
                    <svg className="w-3.5 h-3.5 text-[#8b1e3f] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t.location}
                  </p>
                </div>
                <span className="bg-[#f5efe6] text-[#8b1e3f] border border-[#e7dac8] text-[11px] font-bold px-2.5 py-1 rounded-md shrink-0">
                  {t.screenType || "IMAX 4K"}
                </span>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-[#e7dac8]/60 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-[#8b1e3f]">
                  {t.priceRange || `₹${t.price || 250} - ₹${(t.price || 250) * 2}`}
                </div>
                <div className="text-[11px] text-[#4b2e1e]">
                  Ticket Price: <span className="font-bold text-[#2e1c14]">₹{t.price || 250}</span>
                </div>
              </div>

              <Motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSelectSeats(t)}
                className="bg-[#8b1e3f] hover:bg-[#5b0f1b] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>Select Seats</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Motion.button>
            </div>
          </Motion.div>
        ))}
      </div>
    </div>
  );
}

export default TheatreList;
