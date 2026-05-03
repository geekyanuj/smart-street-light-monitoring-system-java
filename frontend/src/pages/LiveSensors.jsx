import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { List, Zap, Activity, Lightbulb, Clock, CheckCircle2, RefreshCw, Filter } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function LiveSensors() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReadings = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get(`${API_BASE}/api/telemetry/history?limit=50`);
      setReadings(res.data);
    } catch (err) {
      console.error("Error fetching telemetry log", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <List className="text-blue-500" />
            Telemetry Data Log
          </h2>
          <p className="text-gray-400">Historical records of all feeder transmissions</p>
        </div>
        
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchReadings}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600/10 border border-blue-500/50 text-blue-500 rounded-xl font-bold hover:bg-blue-600/20 transition-all"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            Sync Logs
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
             <div className="py-20 text-center glass-card">
              <Activity size={48} className="mx-auto text-blue-500 animate-pulse mb-4" />
              <p className="text-gray-400">Loading telemetry records...</p>
             </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {readings.map((reading, index) => (
              <motion.div
                key={reading._id || reading.timestamp + index}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                layout
                className="glass-card p-5 flex flex-wrap md:flex-nowrap items-center gap-4 border-l-4 border-l-blue-500/30 hover:border-l-blue-500 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Lightbulb size={24} className={reading.relayState === 1 ? 'opacity-100' : 'opacity-20'} />
                </div>
                
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white">Feeder Node {reading.feederId}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${reading.relayState === 1 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gray-500/20 text-gray-400'}`}>
                      {reading.relayState === 1 ? 'Relay ON' : 'Relay OFF'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Clock size={12} />
                    <span>{new Date(reading.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8 px-8 border-x border-white/5">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Voltage</p>
                    <p className="text-lg font-mono font-bold text-blue-400">{reading.voltage.toFixed(1)}V</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Power</p>
                    <p className="text-lg font-mono font-bold text-emerald-400">{reading.power.toFixed(1)}W</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Current</p>
                    <p className="text-lg font-mono font-bold text-amber-400">{reading.current.toFixed(2)}A</p>
                  </div>
                </div>

                <div className="text-right">
                   <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Energy</p>
                   <p className="text-sm font-bold text-white">{reading.energy.toFixed(3)} kWh</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}