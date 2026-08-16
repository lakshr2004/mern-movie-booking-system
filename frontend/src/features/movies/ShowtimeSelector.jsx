import { motion as Motion } from "framer-motion";

function ShowtimeSelector({ showtimes, activeTime, onSelectTime }) {
  if (!showtimes || showtimes.length === 0) return null;

  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-[#5b0f1b] flex items-center gap-2">
          <svg className="w-5 h-5 text-[#8b1e3f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Select Showtime Slot (5 Daily Shows)
        </h3>
        <span className="text-xs text-[#8b1e3f] bg-[#f5efe6] px-3 py-1 rounded-full font-semibold border border-[#e7dac8]">
          10 Venues Available per Time
        </span>
      </div>

      {/* 5 Showtime Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {showtimes.map((slot, index) => {
          const isActive = activeTime === slot.time;
          return (
            <Motion.button
              key={slot.time || index}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectTime(slot.time)}
              className={`py-3 px-4 rounded-xl border font-bold text-sm tracking-wide transition-all shadow-sm flex flex-col items-center justify-center gap-1 ${
                isActive
                  ? "bg-[#8b1e3f] text-white border-[#5b0f1b] shadow-md ring-2 ring-[#8b1e3f]/30"
                  : "bg-[#faf7f2] text-[#2e1c14] border-[#e7dac8] hover:border-[#8b1e3f] hover:bg-[#f5efe6]"
              }`}
            >
              <span className="text-base font-extrabold">{slot.time}</span>
              <span className={`text-[11px] font-medium ${isActive ? "text-amber-200" : "text-[#8b1e3f]"}`}>
                {slot.theatres?.length || 10} Theatres
              </span>
            </Motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default ShowtimeSelector;
