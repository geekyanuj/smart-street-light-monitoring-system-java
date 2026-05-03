import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  BarChart3, 
  Settings, 
  LogOut,
  Radio,
  Lightbulb
} from "lucide-react";
import logonew from "../assets/logo-new.jpg";

const MenuItem = ({ to, icon: Icon, label, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </NavLink>
);

export default function Sidebar() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="h-screen w-72 bg-black/40 backdrop-blur-xl border-r border-white/5 text-white flex flex-col z-50">
      <div className="p-8 flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-xl glow-shadow">
          <Lightbulb size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">SSLMS</h1>
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Smart Control</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-4">Menu</div>
        <MenuItem to="/" icon={LayoutDashboard} label="Dashboard" end />
        <MenuItem to="/map" icon={MapIcon} label="Geospatial Map" />
        <MenuItem to="/analytics" icon={BarChart3} label="Analytics" />
        <MenuItem to="/live" icon={Radio} label="Telemetry Logs" />
        
        <div className="pt-8">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-4">Configuration</div>
          <MenuItem to="/settings" icon={Settings} label="System Settings" />
        </div>
      </nav>

      <div className="p-4 border-t border-white/5">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-300"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
