import { useEffect, useState } from "react";
import { AlertTriangle, Bell, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getDevices, getLatestTelemetry } from "../api/deviceApi";

export default function AlertPanel() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const devRes = await getDevices();
      const devices = devRes.data;

      const alertList = [];

      for (const device of devices) {
        try {
          const telRes = await getLatestTelemetry(device.deviceId);
          const tel = telRes.data;

          if (tel) {
            // Logic: Power is > 30% away from baseline while ON
            const isOn = tel.power > 5;
            const deviation = Math.abs(tel.power - device.baselineWatt);
            const isFaulty = isOn && (deviation > (device.baselineWatt * 0.3));

            if (isFaulty) {
              alertList.push({
                deviceId: device.deviceId,
                area: device.area,
                power: tel.power,
                baseline: device.baselineWatt,
                time: tel.timestamp
              });
            }
          }
        } catch (e) {
          // Skip if no telemetry found
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
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  if (alerts.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-red-600 mb-2 px-1">
        <Bell size={18} className="animate-pulse" />
        <h3 className="font-bold text-sm uppercase tracking-widest">Active Anomalies</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.deviceId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border border-red-100 p-4 rounded-xl flex items-start gap-4 shadow-sm"
            >
              <div className="p-3 bg-red-50 rounded-lg text-red-600">
                <AlertTriangle size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Load Fault</span>
                  <span className="text-[10px] text-slate-400 font-medium">{new Date(alert.time).toLocaleTimeString()}</span>
                </div>
                <h4 className="font-bold text-slate-900 mt-1">Node #{alert.deviceId}</h4>
                <p className="text-xs text-slate-500 mt-1">{alert.area}</p>
                
                <div className="mt-3 flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="text-[10px]">
                    <p className="text-slate-400 font-bold uppercase">Measured</p>
                    <p className="text-red-600 font-bold">{alert.power.toFixed(1)}W</p>
                  </div>
                  <div className="text-right text-[10px]">
                    <p className="text-slate-400 font-bold uppercase">Baseline</p>
                    <p className="text-slate-700 font-bold">{alert.baseline}W</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}