import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Activity,
  Lightbulb,
  Power,
  Battery,
  Clock,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Search
} from "lucide-react";
import axios from "axios";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import HierarchySelector from "../components/HierarchySelector";
import AlertPanel from "../components/AlertPanel";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const StatCard = ({ title, value, unit, icon: Icon, color, alert }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`glass-card p-6 flex items-center gap-6 border-l-4 ${alert ? 'border-l-red-500 bg-red-500/5' : `border-l-${color}-500/50`}`}
  >
    <div className={`p-4 rounded-2xl bg-${color}-500/10 text-${color}-500`}>
      <Icon size={32} />
    </div>
    <div className="flex-1">
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      <div className="flex items-baseline gap-1">
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        <span className="text-gray-500 text-xs font-semibold">{unit}</span>
      </div>
      {alert && <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
        <AlertTriangle size={10} /> Threshold Fault
      </p>}
    </div>
  </motion.div>
);

export default function Dashboard() {
  const [telemetry, setTelemetry] = useState(null);
  const [history, setHistory] = useState([]);
  const [feeder, setFeeder] = useState(null);
  const [selectedFeederId, setSelectedFeederId] = useState(null);
  const [isRelayOn, setIsRelayOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (id) => {
    if (!id) return;
    setRefreshing(true);
    try {
      const [latestRes, historyRes, feederRes] = await Promise.all([
        axios.get(`${API_BASE}/api/telemetry/latest?feederId=${id}`),
        axios.get(`${API_BASE}/api/telemetry/history?limit=30&feederId=${id}`),
        axios.get(`${API_BASE}/api/feeders/${id}`)
      ]);

      setTelemetry(latestRes.data);
      setHistory(historyRes.data.reverse());
      setFeeder(feederRes.data);
      if (latestRes.data) {
        setIsRelayOn(latestRes.data.relayState === 1);
      }
    } catch (err) {
      console.error("Error fetching telemetry", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedFeederId) {
      fetchData(selectedFeederId);
    }
  }, [selectedFeederId]);

  const toggleRelay = async () => {
    try {
      const newState = isRelayOn ? 0 : 1;
      await axios.post(`${API_BASE}/api/device/control`, { state: newState });
      setIsRelayOn(!isRelayOn);
      setTimeout(() => fetchData(selectedFeederId), 2000);
    } catch (err) {
      console.error("Error toggling relay", err);
    }
  };

  const isFaulty = telemetry && feeder && isRelayOn && (
    telemetry.power < feeder.thresholds.minPower ||
    telemetry.power > feeder.thresholds.maxPower
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-white via-blue-400 to-white bg-clip-text text-transparent tracking-tighter">
            NODE MONITORING
          </h1>
          <p className="text-gray-400 mt-1 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Viewing Last Fetched Records
          </p>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchData(selectedFeederId)}
            className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all shadow-xl"
          >
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
            <span className="text-sm font-bold">RE-FETCH DATA</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleRelay}
            className={`flex items-center gap-3 px-8 py-3 rounded-2xl font-black transition-all shadow-lg glow-shadow ${isRelayOn
              ? "bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30"
              : "bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 hover:bg-emerald-500/30"
              }`}
          >
            <Power size={20} />
            {isRelayOn ? "SHUTDOWN NODE" : "ACTIVATE NODE"}
          </motion.button>
        </div>
      </div>

      {/* Alert Panel */}
      <AlertPanel />

      {/* Hierarchy Selector */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-500 px-1">
          <Search size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Select Location Hierarchy</span>
        </div>
        <HierarchySelector onFeederSelect={setSelectedFeederId} />
      </section>

      {!selectedFeederId ? (
        <div className="py-32 text-center glass-card border-dashed">
          <Activity size={64} className="mx-auto text-gray-800 mb-6" />
          <h3 className="text-2xl font-bold text-gray-500">No Feeder Selected</h3>
          <p className="text-gray-600 mt-2">Please use the hierarchy selector above to view node data</p>
        </div>
      ) : (
        <>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Line Voltage"
              value={telemetry?.voltage?.toFixed(1) || "0.0"}
              unit="V"
              icon={Zap}
              color="blue"
            />
            <StatCard
              title="Current Load"
              value={telemetry?.current?.toFixed(2) || "0.00"}
              unit="A"
              icon={Activity}
              color="purple"
            />
            <StatCard
              title="Active Power"
              value={telemetry?.power?.toFixed(1) || "0.0"}
              unit="W"
              icon={Lightbulb}
              color="yellow"
              alert={isFaulty}
            />
            <StatCard
              title="Node Energy"
              value={telemetry?.energy?.toFixed(3) || "0.000"}
              unit="kWh"
              icon={Battery}
              color="emerald"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-card p-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
                  <TrendingUp size={20} className="text-blue-500" />
                  Historical Power Consumption
                </h3>
              </div>

              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(time) => new Date(time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      stroke="#4b5563"
                      fontSize={10}
                    />
                    <YAxis stroke="#4b5563" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                      itemStyle={{ color: '#3b82f6' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="power"
                      stroke="#3b82f6"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorPower)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-500" />
                Node Integrity
              </h3>

              <div className="space-y-6">
                <div className="p-5 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity size={48} />
                  </div>
                  <p className="text-[10px] text-gray-500 mb-1 font-black uppercase tracking-widest">Active Poles</p>
                  <p className="text-3xl font-black text-white">20 / {feeder?.poleCount || 20}</p>
                </div>

                <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] text-gray-500 mb-1 font-black uppercase tracking-widest">Last Update Recieved</p>
                  <p className="text-sm font-bold text-blue-400">
                    {telemetry ? new Date(telemetry.timestamp).toLocaleString() : 'PENDING FETCH'}
                  </p>
                </div>

                <div className="flex-1 space-y-4">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest border-b border-white/5 pb-2">Transmission Log</p>
                  <div className="space-y-3">
                    {history.slice(-4).reverse().map((entry, i) => (
                      <div key={i} className="flex items-center justify-between text-xs bg-white/5 p-3 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${entry.relayState === 1 ? 'bg-emerald-500' : 'bg-gray-500'}`}></div>
                          <span className="text-gray-400 font-medium">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <span className="text-white font-black">{entry.power.toFixed(1)}W</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}