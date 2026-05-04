import { useEffect, useState } from "react";
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
  ComposedChart,
  Line
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Zap, Activity, Battery, Filter, BarChart3, PieChart, AlertCircle } from "lucide-react";
import HierarchySelector from "../components/HierarchySelector";
import { getHistory } from "../api/deviceApi";

export default function Analytics() {
  const [data, setData] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchHistory = async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await getHistory(id);
      if (res.data && Array.isArray(res.data)) {
        setData(res.data.reverse()); // Reverse to show chronological order on charts
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch historical telemetry data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDeviceId) {
      fetchHistory(selectedDeviceId);
    }
  }, [selectedDeviceId]);

  const chartCard = (title, Icon, color, dataKey, unit, chartType = "area") => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="standard-card p-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-slate-100 text-slate-600`}>
            <Icon size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(time) => new Date(time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  stroke="#94a3b8"
                  fontSize={10}
                />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey={dataKey} 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  name={title}
                  unit={unit}
                  fill={`url(#color${dataKey})`} 
                  animationDuration={1000}
                />
              </AreaChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(time) => new Date(time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  stroke="#94a3b8"
                  fontSize={10}
                />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Bar dataKey={dataKey} fill="#6366f1" radius={[4, 4, 0, 0]} name={title} unit={unit} />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Insufficient Data for Analytics</p>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics Engine</h2>
          <p className="text-slate-500 font-medium">Performance data across your infrastructure</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-xs font-bold uppercase tracking-widest">
           <AlertCircle size={16} />
           {error}
        </div>
      )}

      {/* Filter Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-400 px-1">
          <Filter size={14} />
          <h3 className="font-bold text-[10px] uppercase tracking-widest">Infrastructure Hierarchy</h3>
        </div>
        <HierarchySelector onFeederSelect={setSelectedDeviceId} />
      </section>

      {!selectedDeviceId ? (
         <div className="py-32 text-center standard-card border-dashed bg-slate-50/50">
            <PieChart size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-500">Awaiting Selection</h3>
            <p className="text-slate-400 mt-1">Select a device from the hierarchy to generate analysis</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {chartCard("Voltage Profile", Zap, "blue", "voltage", "V")}
          {chartCard("Power Consumption", Battery, "emerald", "power", "W")}
          {chartCard("Current Load Trend", Activity, "amber", "current", "A")}
          {chartCard("Energy Accumulation", TrendingUp, "purple", "power", "W", "bar")}
          
          {/* Efficiency Analysis */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-2 standard-card p-6"
          >
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                <BarChart3 size={20} />
               </div>
               <h3 className="text-lg font-bold text-slate-900 tracking-tight">Active Power Over Time</h3>
            </div>
            <div className="h-[400px] w-full">
              {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(time) => new Date(time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit' })}
                      stroke="#94a3b8"
                      fontSize={10}
                    />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                    <Bar dataKey="power" barSize={20} fill="#3b82f6" radius={[4, 4, 0, 0]} name="Power (W)" />
                    <Line type="monotone" dataKey="power" stroke="#2563eb" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Insufficient Data</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}