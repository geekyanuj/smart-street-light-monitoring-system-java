import { useEffect, useState } from "react";
import {
  Bell,
  User,
  Calendar
} from "lucide-react";

export default function Navbar() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex items-center justify-between ml-4">
      <div className="hidden md:flex items-center gap-6 flex-1">
        <div className="relative max-w-xs w-full group">
          {/* Optional search or other element */}
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {/* Clock */}
        <div className="hidden sm:flex flex-col items-end mr-2 md:mr-4">
          <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            <Calendar size={12} />
            <span>{now.toLocaleDateString("en-IN", { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
          <span className="text-sm md:text-xl font-bold text-gray-400 tracking-widest font-mono">
            {now.toLocaleTimeString("en-IN", { hour12: true })}
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-colors border border-white/5">
            <Bell size={18} />
          </button>
          <button className="flex items-center gap-2 p-1 md:p-1.5 md:pr-4 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors glow-shadow">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <User size={16} />
            </div>
            <span className="hidden sm:inline text-xs font-bold text-white uppercase tracking-wider">Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
}