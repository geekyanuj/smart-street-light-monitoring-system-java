import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Cpu,
  MapPin,
  Hash,
  Zap,
  Save,
  AlertCircle,
  Building2,
  Navigation,
  Activity
} from "lucide-react";
import { createDevice, updateDevice } from "../api/deviceApi";

export default function AddDeviceForm({ isOpen, onClose, onDeviceAdded, initialData = null }) {
  const [formData, setFormData] = useState({
    deviceId: "",
    feederId: "",
    landmark: "",
    area: "",
    wardNo: "",
    latitude: "",
    longitude: "",
    status: "OFFLINE",
    baselineWatt: "",
    lowerOffset: "",
    upperOffset: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        // Ensure numbers are handled
        wardNo: initialData.wardNo || "",
        baselineWatt: initialData.baselineWatt || "",
        latitude: initialData.latitude || "",
        longitude: initialData.longitude || ""
      });
    } else {
      setFormData({
        deviceId: "",
        feederId: "",
        landmark: "",
        area: "",
        wardNo: "",
        baselineWatt: "",
        status: "OFFLINE",
        latitude: "",
        longitude: ""
      });
    }
    setError("");
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ["wardNo", "baselineWatt", "latitude", "longitude"].includes(name) ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isEditMode) {
        await updateDevice(formData.deviceId, formData);
      } else {
        await createDevice(formData);
      }
      onDeviceAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} device.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-2xl overflow-hidden shadow-2xl rounded-2xl border border-slate-200"
            >
              {/* Header */}
              <div className="relative p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                      <Cpu size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        {isEditMode ? 'Update Node Registry' : 'Provision New Node'}
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
                        {isEditMode ? `Modifying configuration for #${formData.deviceId}` : 'Register a new street light controller in the system'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm"
                  >
                    <AlertCircle size={18} />
                    {error}
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Device ID */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Hash size={12} /> Device Identifier
                    </label>
                    <input
                      required
                      name="deviceId"
                      value={formData.deviceId}
                      onChange={handleChange}
                      disabled={isEditMode}
                      placeholder="e.g. SL-DHN-001"
                      className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors ${isEditMode ? 'opacity-50 cursor-not-allowed font-bold' : ''}`}
                    />
                  </div>

                  {/* Feeder ID */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Zap size={12} /> Parent Feeder ID
                    </label>
                    <input
                      required
                      name="feederId"
                      value={formData.feederId}
                      onChange={handleChange}
                      placeholder="e.g. FDR-01"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Ward No */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Building2 size={12} /> Ward Number
                    </label>
                    <input
                      required
                      type="number"
                      name="wardNo"
                      value={formData.wardNo}
                      onChange={handleChange}
                      placeholder="e.g. 12"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Area */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Navigation size={12} /> Municipal Area
                    </label>
                    <input
                      required
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      placeholder="e.g. Dhanbad Central"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Landmark */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <MapPin size={12} /> Precise Landmark
                    </label>
                    <input
                      required
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleChange}
                      placeholder="e.g. Near City Center Mall"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Coordinates */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Navigation size={12} /> Latitude
                    </label>
                    <input
                      required
                      type="number"
                      step="any"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      placeholder="e.g. 23.7957"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Navigation size={12} /> Longitude
                    </label>
                    <input
                      required
                      type="number"
                      step="any"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="e.g. 86.4304"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Baseline Wattage */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Activity size={12} /> Baseline Power (W)
                    </label>
                    <input
                      required
                      type="number"
                      name="baselineWatt"
                      value={formData.baselineWatt}
                      onChange={handleChange}
                      placeholder="e.g. 150"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Lower Offset Wattage */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Activity size={12} /> Lower Offset Power (W)
                    </label>
                    <input
                      required
                      type="number"
                      min={0}
                      max={100}
                      name="lowerOffset"
                      value={formData.lowerOffset}
                      onChange={handleChange}
                      placeholder="e.g. 150"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Upper Offset Wattage */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Activity size={12} /> Upper Offset Power (W)
                    </label>
                    <input
                      required
                      type="number"
                      min={0}
                      max={100}
                      name="upperOffset"
                      value={formData.upperOffset}
                      onChange={handleChange}
                      placeholder="e.g. 150"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 btn-secondary"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] btn-primary flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Save size={18} />
                        {isEditMode ? 'UPDATE CONFIGURATION' : 'REGISTER DEVICE'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
