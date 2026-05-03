import { useEffect, useState } from "react";
import axios from "axios";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  ComposedChart,
  Line
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Zap, Activity, Battery, Filter, BarChart3, PieChart } from "lucide-react";
import HierarchySelector from "../components/HierarchySelector";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Analytics() {
  const [data, setData] = useState([]);
  const [selectedFeederId, setSelectedFeederId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/telemetry/history?limit=100&feederId=${id}`);
      setData(res.data.reverse());
    } catch (err) {
      console.error("Error fetching history data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFeederId) {
      fetchHistory(selectedFeederId);
    }
  }, [selectedFeederId]);

  const chartCard = (title, Icon, color, dataKey, unit, chartType = "area") => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-500`}>
            <Icon size={20} />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : '#f59e0b'} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : '#f59e0b'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(time) => new Date(time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                stroke="#4b5563"
                fontSize={10}
              />
              <YAxis stroke="#4b5563" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                labelStyle={{ color: '#94a3b8', fontSize: '10px' }}
              />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : '#f59e0b'} 
                strokeWidth={3}
                fillOpacity={1} 
                name={title}
                unit={unit}
                fill={`url(#color${dataKey})`} 
                animationDuration={1500}
              />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(time) => new Date(time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                stroke="#4b5563"
                fontSize={10}
              />
              <YAxis stroke="#4b5563" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              />
              <Bar dataKey={dataKey} fill={color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : '#8b5cf6'} radius={[4, 4, 0, 0]} name={title} unit={unit} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter">ANALYTICS ENGINE</h2>
          <p className="text-gray-400 font-medium">Segmented performance data across your infrastructure</p>
        </div>
      </div>

      {/* Filter Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-blue-500 px-1">
          <Filter size={18} />
          <h3 className="font-bold text-sm uppercase tracking-widest">Filter by Hierarchy</h3>
        </div>
        <HierarchySelector onFeederSelect={setSelectedFeederId} />
      </section>

      {!selectedFeederId ? (
         <div className="py-32 text-center glass-card border-dashed">
            <PieChart size={64} className="mx-auto text-gray-800 mb-6" />
            <h3 className="text-2xl font-bold text-gray-500">Awaiting Selection</h3>
            <p className="text-gray-600 mt-2">Select a Ward, Area and Feeder to generate analysis</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {chartCard("Voltage Profile", Zap, "blue", "voltage", "V")}
          {chartCard("Power Consumption", Battery, "emerald", "power", "W")}
          {chartCard("Current Load Trend", Activity, "amber", "current", "A")}
          {chartCard("Energy Accumulation", TrendingUp, "purple", "energy", "kWh", "bar")}
          
          {/* Efficiency Analysis */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-2 glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500">
                <BarChart3 size={20} />
               </div>
               <h3 className="text-xl font-bold text-white tracking-tight">Active Power Over Time</h3>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(time) => new Date(time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit' })}
                    stroke="#4b5563"
                    fontSize={10}
                  />
                  <YAxis stroke="#4b5563" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Bar dataKey="power" barSize={20} fill="#f472b6" radius={[4, 4, 0, 0]} name="Power (W)" />
                  <Line type="monotone" dataKey="power" stroke="#f472b6" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}