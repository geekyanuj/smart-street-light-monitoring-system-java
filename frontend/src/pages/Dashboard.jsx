import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Activity,
  Lightbulb,
  Power,
  Battery,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Search,
  Plus,
  Cpu
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import HierarchySelector from "../components/HierarchySelector";
import AlertPanel from "../components/AlertPanel";
import AddDeviceForm from "../components/AddDeviceForm";
import { getDevice, getLatestTelemetry, sendCommand, syncNow, broadcastCommand } from "../api/deviceApi";

const StatCard = ({ title, value, unit, icon: Icon, color, alert }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`standard-card p-6 flex items-center gap-6 border-l-4 ${alert ? 'border-l-red-500 bg-red-50' : `border-l-blue-500`}`}
  >
    <div className={`p-4 rounded-xl bg-slate-100 text-slate-600`}>
      <Icon size={28} />
    </div>
    <div className="flex-1">
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        <span className="text-slate-400 text-xs font-medium">{unit}</span>
      </div>
      {alert && <p className="text-[10px] text-red-600 mt-1 font-bold uppercase tracking-wider flex items-center gap-1">
        <AlertTriangle size={10} /> Threshold Fault
      </p>}
    </div>
  </motion.div>
);

export default function Dashboard() {
  const [telemetry, setTelemetry] = useState(null);
  const [device, setDevice] = useState(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [isRelayOn, setIsRelayOn] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  const fetchData = useCallback(async (id) => {
    if (!id) return;
    setRefreshing(true);
    try {
      const [deviceRes, telemetryRes] = await Promise.all([
        getDevice(id),
        getLatestTelemetry(id).catch(() => ({ data: null }))
      ]);

      setDevice(deviceRes.data);
      setTelemetry(telemetryRes.data);

      if (telemetryRes.data) {
        setIsRelayOn(telemetryRes.data.power > 5);
      }
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDeviceId) {
      fetchData(selectedDeviceId);
    }
  }, [selectedDeviceId, fetchData]);

  const handleControl = async () => {
    if (!selectedDeviceId || !device) return;
    const command = device.status === 'ON' ? 'OFF' : 'ON';
    setRefreshing(true);
    try {
      await sendCommand(selectedDeviceId, command);
      setTimeout(() => fetchData(selectedDeviceId), 1500);
    } catch (err) {
      console.error("Control failed", err);
    } finally {
      setRefreshing(false);
    }
  };

  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleManualSync = async () => {
    if (!selectedDeviceId) return;
    setRefreshing(true);
    setSyncSuccess(false);
    try {
      await syncNow(selectedDeviceId);
      await fetchData(selectedDeviceId);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (err) {
      console.error("Sync failed", err);
    } finally {
      setRefreshing(false);
    }
  };
  const handleBroadcast = async (command) => {
    if (!window.confirm(`Are you sure you want to turn ${command} all street lights?`)) return;
    setRefreshing(true);
    try {
      await broadcastCommand(command);
      setTimeout(() => {
        if (selectedDeviceId) fetchData(selectedDeviceId);
      }, 2000);
    } catch (err) {
      console.error("Broadcast failed", err);
    } finally {
      setRefreshing(false);
    }
  };

  const lowerOffset = device?.lowerOffset ?? 100;
  const upperOffset = device?.upperOffset ?? 100;

  const isFaulty = telemetry && device && isRelayOn && (
    telemetry.power < device.baselineWatt - lowerOffset ||
    telemetry.power > device.baselineWatt + upperOffset
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight"> Smart Street Light Monitoring System</h3>
          <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${refreshing ? 'bg-blue-500 animate-pulse' : (telemetry ? 'bg-emerald-500' : 'bg-slate-300')}`}></span>
            {selectedDeviceId ? `Node #${selectedDeviceId} Active` : 'Select Node from Hierarchy'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Master Broadcast Group */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => handleBroadcast('ON')}
              disabled={refreshing}
              className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-sm"
            >
              Master ON
            </button>
            <button
              onClick={() => handleBroadcast('OFF')}
              disabled={refreshing}
              className="px-3 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-slate-800 transition-all disabled:opacity-50 shadow-sm"
            >
              Master OFF
            </button>
          </div>

          <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden lg:block"></div>

          <button
            onClick={() => setIsAddFormOpen(true)}
            className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
            title="Provision Node"
          >
            <Plus size={20} />
          </button>

          <button
            onClick={handleManualSync}
            disabled={refreshing}
            className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
            title="Hardware Sync"
          >
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
          </button>

          {device && (
            <button
              onClick={handleControl}
              disabled={refreshing}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all uppercase tracking-widest shadow-xl shadow-slate-200 ${device?.status === 'ON'
                ? "bg-white text-red-600 border border-red-100 hover:bg-red-50"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                }`}
            >
              <Power size={14} />
              {device?.status === 'ON' ? 'Node Shutdown' : 'Activate Node'}
            </button>
          )}
        </div>
      </div>

      {/* Notifications Layer */}
      <AnimatePresence>
        {isFaulty && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between gap-3 text-red-600 mb-2"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle size={18} />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider">Critical Fault Detected</p>
                <p className="text-[10px] font-medium opacity-80">Power consumption for #{selectedDeviceId} is outside nominal safety thresholds.</p>
                <p className="text-[10px] font-medium opacity-80">
                  Power ({telemetry?.power?.toFixed(1)}W) is outside configured range:{" "}
                  {(device.baselineWatt - lowerOffset).toFixed(1)}W -{" "}
                  {(device.baselineWatt + upperOffset).toFixed(1)}W
                </p>
              </div>
            </div>
            <div className="px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-md animate-pulse">CRITICAL</div>
          </motion.div>
        )}

        {syncSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-600 text-sm font-bold uppercase tracking-widest mb-2"
          >
            <CheckCircle2 size={18} />
            Hardware Parameters Synchronized
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selector and Main Content */}
      <div className="grid grid-cols-1 gap-8">
        <HierarchySelector onFeederSelect={setSelectedDeviceId} />
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
              title="Base Consumption"
              value={device?.baselineWatt || "0"}
              unit="W"
              icon={Battery}
              color="emerald"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 standard-card p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Cpu size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Device Specifications</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoRow label="Device ID" value={device?.deviceId} />
                <InfoRow label="Feeder ID" value={device?.feederId || "N/A"} />
                <InfoRow label="Area Name" value={device?.area} />
                <InfoRow label="Location" value={device?.landmark} />
                <InfoRow label="Ward Number" value={device?.wardNo} />
                <InfoRow label="Registration" value={device?.status} />
                <InfoRow label="Lower Offset" value={`${(lowerOffset).toFixed(0)} W`} />
                <InfoRow label="Upper Offset" value={`${(upperOffset).toFixed(0)} W`} />
              </div>
            </div>

            <div className="standard-card p-6 flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-500" />
                Operational Status
              </h3>

              <div className="space-y-4">
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-widest">Connectivity</p>
                  <p className={`text-2xl font-bold ${telemetry ? 'text-emerald-600' : 'text-red-500'}`}>
                    {telemetry ? 'ONLINE' : 'OFFLINE'}
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-widest">Last Update</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {telemetry?.timestamp ? new Date(telemetry.timestamp).toLocaleString() : 'No Data'}
                  </p>
                </div>

                <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-100">
                  <p className="text-[10px] text-blue-600 mb-2 font-bold uppercase tracking-widest">General Info</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Before making any changes to the device, ensure that the device is in a safe state.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      </div>

      <AddDeviceForm
        isOpen={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
        onDeviceAdded={() => window.location.reload()}
      />
    </div>
  );
}

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col pb-4 border-b border-slate-50">
    <span className="text-slate-400 uppercase text-[10px] font-bold tracking-widest">{label}</span>
    <span className="text-slate-900 font-semibold mt-1">{value || "---"}</span>
  </div>
);