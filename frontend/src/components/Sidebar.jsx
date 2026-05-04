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

export default function Sidebar({ onClose }) {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="h-screen w-72 bg-white border-r border-slate-200 text-slate-900 flex flex-col z-50">
      <div className="p-8 flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Lightbulb size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">SSLMS</h1>
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Smart Control</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">Menu</div>
        <div onClick={onClose}><MenuItem to="/" icon={LayoutDashboard} label="Dashboard" end /></div>
        <div onClick={onClose}><MenuItem to="/map" icon={MapIcon} label="Geospatial Map" /></div>
        <div onClick={onClose}><MenuItem to="/analytics" icon={BarChart3} label="Analytics" /></div>
        <div onClick={onClose}><MenuItem to="/live" icon={Radio} label="Telemetry Logs" /></div>
        
        <div className="pt-8">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">Configuration</div>
          <div onClick={onClose}><MenuItem to="/settings" icon={Settings} label="System Settings" /></div>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
