import { useEffect, useState } from "react";
import { 
  Bell, 
  Search, 
  User, 
  Grid,
  SearchIcon,
  HelpCircle,
  Calendar
} from "lucide-react";
import socket from "../api/socket";

export default function Navbar() {
  const [now, setNow] = useState(new Date());
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    
    socket.on("connect", () => setIsOnline(true));
    socket.on("disconnect", () => setIsOnline(false));

    return () => {
      clearInterval(interval);
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full h-20 px-8 flex items-center justify-between bg-black/20 backdrop-blur-lg border-b border-white/5">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative max-w-md w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search devices or analytics..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* System Status */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {isOnline ? 'Network Online' : 'Network Offline'}
          </span>
        </div>

        {/* Clock */}
        <div className="flex flex-col items-end mr-4">
          <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            <Calendar size={12} />
            <span>{now.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
          <span className="text-xl font-bold text-white tracking-widest font-mono">
            {now.toLocaleTimeString("en-US", { hour12: false })}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-colors border border-white/5">
            <Bell size={20} />
          </button>
          <button className="flex items-center gap-3 p-1.5 pr-4 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors glow-shadow">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <User size={18} />
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
}