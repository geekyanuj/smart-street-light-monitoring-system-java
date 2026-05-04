import { useState, useEffect } from "react";
import { getDevices } from "../api/deviceApi";
import { ChevronRight, MapPin, Grid, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HierarchySelector({ onFeederSelect }) {
  const [hierarchy, setHierarchy] = useState({});
  const [selectedWard, setSelectedWard] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedFeeder, setSelectedFeeder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndBuildHierarchy = async () => {
      try {
        const res = await getDevices();
        const devices = res.data;
        
        // Build hierarchy: Ward -> Area -> FeederIds
        const tree = {};
        devices.forEach(device => {
          const ward = `Ward ${device.wardNo || 'Unknown'}`;
          const area = device.area || 'Unknown Area';
          const feeder = device.feederId || device.deviceId;

          if (!tree[ward]) tree[ward] = {};
          if (!tree[ward][area]) tree[ward][area] = [];
          if (!tree[ward][area].includes(feeder)) {
            tree[ward][area].push(feeder);
          }
        });

        setHierarchy(tree);
        
        // Auto-select first available
        const wards = Object.keys(tree);
        if (wards.length > 0) {
          const firstWard = wards[0];
          setSelectedWard(firstWard);
          
          const areas = Object.keys(tree[firstWard]);
          if (areas.length > 0) {
            const firstArea = areas[0];
            setSelectedArea(firstArea);
            
            const feeders = tree[firstWard][firstArea];
            if (feeders.length > 0) {
              const firstFeeder = feeders[0];
              setSelectedFeeder(firstFeeder);
              onFeederSelect(firstFeeder);
            }
          }
        }
      } catch (err) {
        console.error("Error building hierarchy", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAndBuildHierarchy();
  }, [onFeederSelect]);

  const handleWardChange = (ward) => {
    setSelectedWard(ward);
    const areas = Object.keys(hierarchy[ward]);
    const firstArea = areas[0];
    setSelectedArea(firstArea);
    const firstFeeder = hierarchy[ward][firstArea][0];
    setSelectedFeeder(firstFeeder);
    onFeederSelect(firstFeeder);
  };

  const handleAreaChange = (area) => {
    setSelectedArea(area);
    const firstFeeder = hierarchy[selectedWard][area][0];
    setSelectedFeeder(firstFeeder);
    onFeederSelect(firstFeeder);
  };

  const handleFeederChange = (feeder) => {
    setSelectedFeeder(feeder);
    onFeederSelect(feeder);
  };

  if (loading) return (
    <div className="flex gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-10 w-32 bg-slate-200 animate-pulse rounded-lg"></div>
      ))}
    </div>
  );

  if (Object.keys(hierarchy).length === 0) {
    return <div className="text-slate-500 text-sm font-medium p-4 bg-slate-50 rounded-xl border border-slate-200">No devices found. Add a device to see the hierarchy.</div>;
  }

  return (
    <div className="flex flex-wrap items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
      {/* Ward Selection */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100 group hover:border-blue-200 transition-colors">
        <Layers size={14} className="text-slate-400 group-hover:text-blue-500" />
        <select 
          value={selectedWard || ""} 
          onChange={(e) => handleWardChange(e.target.value)}
          className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer pr-4"
        >
          {Object.keys(hierarchy).map(ward => (
            <option key={ward} value={ward}>{ward}</option>
          ))}
        </select>
      </div>

      <ChevronRight size={16} className="text-slate-300" />

      {/* Area Selection */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100 group hover:border-purple-200 transition-colors">
        <Grid size={14} className="text-slate-400 group-hover:text-purple-500" />
        <select 
          value={selectedArea || ""} 
          onChange={(e) => handleAreaChange(e.target.value)}
          className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer pr-4"
        >
          {selectedWard && Object.keys(hierarchy[selectedWard]).map(area => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>
      </div>

      <ChevronRight size={16} className="text-slate-300" />

      {/* Feeder/Pole Selection */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100 group hover:border-emerald-200 transition-colors">
        <MapPin size={14} className="text-slate-400 group-hover:text-emerald-500" />
        <select 
          value={selectedFeeder || ""} 
          onChange={(e) => handleFeederChange(e.target.value)}
          className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer pr-4"
        >
          {selectedArea && hierarchy[selectedWard][selectedArea].map(feeder => (
            <option key={feeder} value={feeder}>ID: {feeder}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
