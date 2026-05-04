import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, Zap, Activity, Lightbulb, Clock, RefreshCw } from "lucide-react";
import { getGlobalLog } from "../api/deviceApi";

export default function LiveSensors() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReadings = async () => {
    setRefreshing(true);
    try {
      const res = await getGlobalLog();
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <List className="text-blue-600" />
            Telemetry Data Log
          </h2>
          <p className="text-slate-500 font-medium">Historical records of all system transmissions</p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={fetchReadings}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            <span>Sync Logs</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
             <div className="py-20 text-center standard-card border-dashed bg-slate-50/50">
              <Activity size={40} className="mx-auto text-blue-500 animate-pulse mb-4" />
              <p className="text-slate-400 font-medium">Loading telemetry records...</p>
             </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {readings.length === 0 ? (
              <div className="py-20 text-center standard-card border-dashed bg-slate-50/50">
                <p className="text-slate-400 font-medium">No telemetry records found.</p>
              </div>
            ) : (
              readings.map((reading, index) => (
                <motion.div
                  key={reading.id || reading.timestamp + index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                  className="standard-card p-5 flex flex-wrap md:flex-nowrap items-center gap-6 hover:border-blue-200 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                    <Lightbulb size={24} />
                  </div>
                  
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900">Node: {reading.deviceId}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-600">
                        Transmission
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <Clock size={12} />
                      <span>{new Date(reading.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-8 px-8 border-x border-slate-100">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Voltage</p>
                      <p className="text-base font-bold text-slate-700">{reading.voltage?.toFixed(1) || '0.0'}V</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Power</p>
                      <p className="text-base font-bold text-slate-700">{reading.power?.toFixed(1) || '0.0'}W</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Current</p>
                      <p className="text-base font-bold text-slate-700">{reading.current?.toFixed(2) || '0.00'}A</p>
                    </div>
                  </div>

                  <div className="text-right min-w-[100px]">
                     <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Sequence</p>
                     <p className="text-xs font-bold text-slate-500">ID: {reading.id}</p>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}