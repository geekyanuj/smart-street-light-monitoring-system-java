import { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, 
  Zap, 
  Activity, 
  Clock, 
  Save, 
  RefreshCcw,
  AlertTriangle,
  ChevronDown
} from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Settings() {
  const [settings, setSettings] = useState({ fetchFrequency: 2, fetchTimes: ["06:00", "18:00"] });
  const [feeders, setFeeders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, feedersRes] = await Promise.all([
          axios.get(`${API_BASE}/api/settings`),
          axios.get(`${API_BASE}/api/feeders`)
        ]);
        setSettings(settingsRes.data);
        setFeeders(feedersRes.data);
      } catch (err) {
        console.error("Error fetching settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSettingsSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${API_BASE}/api/settings`, settings);
      setMessage("Settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error saving settings", err);
      setMessage("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleFeederUpdate = async (feeder) => {
    try {
      await axios.post(`${API_BASE}/api/feeders`, feeder);
      setMessage(`Updated thresholds for ${feeder.feederId}`);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error updating feeder", err);
    }
  };

  const manualFetch = async () => {
    try {
      await axios.post(`${API_BASE}/api/settings/fetch`);
      setMessage("Manual fetch command sent to feeders");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error triggering manual fetch", err);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading settings...</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            System Settings
          </h1>
          <p className="text-gray-400 mt-1">Configure data acquisition and fault thresholds</p>
        </div>
        
        <button
          onClick={manualFetch}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg glow-shadow"
        >
          <RefreshCcw size={18} />
          Force Manual Fetch
        </button>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-500/20 border border-emerald-500/50 text-emerald-500 rounded-xl"
        >
          {message}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Fetch Configuration */}
        <section className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Clock className="text-blue-500" />
            <h2 className="text-xl font-bold text-white">Data Fetching Frequency</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Daily Frequency</label>
              <div className="flex gap-4">
                {[1, 2, 3, 4].map(freq => (
                  <button
                    key={freq}
                    onClick={() => setSettings({...settings, fetchFrequency: freq})}
                    className={`flex-1 py-3 rounded-xl border transition-all ${
                      settings.fetchFrequency === freq 
                      ? "bg-blue-600 border-blue-500 text-white" 
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    {freq}x Day
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSettingsSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Global Configuration"}
            </button>
          </div>
        </section>

        {/* Fault Detection Logic */}
        <section className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <AlertTriangle className="text-yellow-500" />
            <h2 className="text-xl font-bold text-white">Fault Detection Rules</h2>
          </div>
          <p className="text-gray-400 text-sm">
            Faults are detected when power consumption deviates from thresholds for a period of 20 lights.
          </p>
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-yellow-500 text-xs">
              Note: System automatically scales thresholds based on active pole count.
            </p>
          </div>
        </section>
      </div>

      {/* Per-Feeder Thresholds */}
      <section className="glass-card p-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
          <Activity className="text-purple-500" />
          <h2 className="text-xl font-bold text-white">Feeder Thresholds</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-sm border-b border-white/5">
                <th className="pb-4 font-medium">Ward / Area</th>
                <th className="pb-4 font-medium">Feeder ID</th>
                <th className="pb-4 font-medium">Min Power (W)</th>
                <th className="pb-4 font-medium">Max Power (W)</th>
                <th className="pb-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {feeders.map((feeder) => (
                <tr key={feeder.feederId} className="group hover:bg-white/5 transition-colors">
                  <td className="py-4">
                    <div className="text-white font-medium">{feeder.ward}</div>
                    <div className="text-gray-500 text-xs">{feeder.area}</div>
                  </td>
                  <td className="py-4 text-blue-400 font-mono">{feeder.feederId}</td>
                  <td className="py-4">
                    <input 
                      type="number"
                      value={feeder.thresholds.minPower}
                      onChange={(e) => {
                        const newFeeders = feeders.map(f => f.feederId === feeder.feederId ? {...f, thresholds: {...f.thresholds, minPower: Number(e.target.value)}} : f);
                        setFeeders(newFeeders);
                      }}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white w-24 focus:border-blue-500 outline-none"
                    />
                  </td>
                  <td className="py-4">
                    <input 
                      type="number"
                      value={feeder.thresholds.maxPower}
                      onChange={(e) => {
                        const newFeeders = feeders.map(f => f.feederId === feeder.feederId ? {...f, thresholds: {...f.thresholds, maxPower: Number(e.target.value)}} : f);
                        setFeeders(newFeeders);
                      }}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white w-24 focus:border-blue-500 outline-none"
                    />
                  </td>
                  <td className="py-4">
                    <button 
                      onClick={() => handleFeederUpdate(feeder)}
                      className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Save size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
