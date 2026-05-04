import { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, 
  Zap, 
  Activity, 
  Clock, 
  Save, 
  RefreshCcw,
  AlertTriangle,
  Plus
} from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";
import { getDevices } from "../api/deviceApi";
import AddDeviceForm from "../components/AddDeviceForm";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/sslms";

export default function Settings() {
  const [settings, setSettings] = useState({ fetchFrequency: 2, fetchTimes: ["06:00", "18:00"] });
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedDeviceForEdit, setSelectedDeviceForEdit] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchInfrastructure = async () => {
    try {
      const devRes = await getDevices();
      setDevices(devRes.data);
    } catch (err) {
      console.error("Error fetching settings data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfrastructure();
  }, []);

  const handleManualSyncAll = async () => {
    setMessage("Broadcasting sync command to all nodes...");
    setTimeout(() => setMessage(""), 3000);
  };

  const openEdit = (device) => {
    setSelectedDeviceForEdit(device);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedDeviceForEdit(null);
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-slate-500 font-medium">Global configuration and node parameters</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => { setSelectedDeviceForEdit(null); setIsFormOpen(true); }}
            className="btn-secondary flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Add Node</span>
          </button>
          
          <button
            onClick={handleManualSyncAll}
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCcw size={18} />
            <span>Sync All Nodes</span>
          </button>
        </div>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl font-bold text-sm"
        >
          {message}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Global Configuration */}
        <section className="standard-card p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Clock size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Polling Interval</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Data Refresh Cycle</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 4, 12].map(freq => (
                  <button
                    key={freq}
                    onClick={() => setSettings({...settings, fetchFrequency: freq})}
                    className={`py-3 rounded-xl border font-bold transition-all ${
                      settings.fetchFrequency === freq 
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" 
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {freq}x Day
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              <Save size={18} />
              {saving ? "SAVING..." : "COMMIT GLOBAL CHANGES"}
            </button>
          </div>
        </section>

        {/* Fault Logic Info */}
        <section className="standard-card p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <AlertTriangle size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Anomalies Detection</h2>
          </div>
          <div className="space-y-4">
            <p className="text-slate-500 text-sm leading-relaxed">
              Automated alerts are triggered when a node's active power consumption deviates by more than <span className="text-slate-900 font-bold">30%</span> from its registered baseline.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
              <div className="p-1 bg-white rounded-md shadow-sm">
                <Zap size={14} className="text-blue-600" />
              </div>
              <p className="text-[10px] text-slate-500 font-bold leading-tight uppercase tracking-wider">
                Note: Fault detection is only active when the relay status is reported as "ON".
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Node List View */}
      <section className="standard-card overflow-hidden">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100 bg-slate-50/50">
          <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
            <Activity size={20} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Registered Infrastructure</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-50/30 border-b border-slate-100">
                <th className="px-6 py-4">Node Identity</th>
                <th className="px-6 py-4">Location Context</th>
                <th className="px-6 py-4">Current Status</th>
                <th className="px-6 py-4">Baseline Load</th>
                <th className="px-6 py-4 text-right">Registry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {devices.map((device) => (
                <tr key={device.deviceId} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-slate-900 font-bold">#{device.deviceId}</div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase">Feeder: {device.feederId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-600 text-sm font-semibold">{device.area}</div>
                    <div className="text-slate-400 text-xs">{device.landmark}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-tighter">
                      Registered
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm border border-blue-100">
                        {device.baselineWatt}W
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openEdit(device)}
                      className="p-2 text-slate-300 hover:text-blue-600 transition-colors"
                    >
                      <SettingsIcon size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {devices.length === 0 && (
            <div className="p-12 text-center text-slate-400 font-medium italic">
              No nodes registered in the system hierarchy.
            </div>
          )}
        </div>
      </section>

      <AddDeviceForm 
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onDeviceAdded={fetchInfrastructure}
        initialData={selectedDeviceForEdit}
      />
    </div>
  );
}
