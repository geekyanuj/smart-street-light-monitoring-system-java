import { useEffect, useState } from "react";
import { AlertCircle, Bell, ChevronRight, AlertTriangle } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AlertPanel() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      // Logic: A fault is an anomaly in power consumption
      // For this panel, we'll fetch latest telemetry for all feeders and check thresholds
      const feedersRes = await axios.get(`${API_BASE}/api/feeders`);
      const feeders = feedersRes.data;

      const alertList = [];

      for (const feeder of feeders) {
        const telRes = await axios.get(`${API_BASE}/api/telemetry/latest?feederId=${feeder.feederId}`);
        const tel = telRes.data;

        if (tel && tel.relayState === 1) {
          if (tel.power < feeder.thresholds.minPower || tel.power > feeder.thresholds.maxPower) {
            alertList.push({
              feederId: feeder.feederId,
              ward: feeder.ward,
              area: feeder.area,
              power: tel.power,
              min: feeder.thresholds.minPower,
              max: feeder.thresholds.maxPower,
              time: tel.timestamp
            });
          }
        }
      }
      setAlerts(alertList);
    } catch (err) {
      console.error("Error fetching alerts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Refresh every 1 minute (not live, but keeps it updated)
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  if (alerts.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-red-500 mb-4 px-1">
        <Bell size={20} className="animate-bounce" />
        <h3 className="font-bold text-lg uppercase tracking-tight">Critical System Alerts</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.feederId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-start gap-4 backdrop-blur-md"
            >
              <div className="p-3 bg-red-500/20 rounded-xl text-red-500">
                <TriangleAlert size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-400 uppercase">Feeder Fault</span>
                  <span className="text-[10px] text-gray-500">{new Date(alert.time).toLocaleTimeString()}</span>
                </div>
                <h4 className="font-bold text-white mt-1">Node #{alert.feederId}</h4>
                <p className="text-xs text-gray-400 mt-1">{alert.ward} • {alert.area}</p>
                <div className="mt-3 flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-500">CONSUMPTION</span>
                  <span className="text-red-500 font-bold">{alert.power}W</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-red-500 h-full w-full opacity-50"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}