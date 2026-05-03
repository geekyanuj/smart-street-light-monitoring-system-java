import { useState, useEffect } from "react";
import axios from "axios";
import { ChevronRight, MapPin, Grid, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function HierarchySelector({ onFeederSelect }) {
  const [hierarchy, setHierarchy] = useState({});
  const [selectedWard, setSelectedWard] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedFeeder, setSelectedFeeder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/feeders/hierarchy`);
        setHierarchy(res.data);
        const firstWard = Object.keys(res.data)[0];
        if (firstWard) {
          setSelectedWard(firstWard);
          const firstArea = Object.keys(res.data[firstWard])[0];
          if (firstArea) {
            setSelectedArea(firstArea);
            const firstFeeder = res.data[firstWard][firstArea][0];
            if (firstFeeder) {
              setSelectedFeeder(firstFeeder);
              onFeederSelect(firstFeeder);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching hierarchy", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHierarchy();
  }, []);

  const handleWardChange = (ward) => {
    setSelectedWard(ward);
    const firstArea = Object.keys(hierarchy[ward])[0];
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

  if (loading) return <div className="animate-pulse h-10 bg-white/5 rounded-xl"></div>;

  return (
    <div className="flex flex-wrap items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
      {/* Ward Selection */}
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
        <Layers size={16} className="text-blue-400" />
        <select 
          value={selectedWard || ""} 
          onChange={(e) => handleWardChange(e.target.value)}
          className="bg-transparent text-sm font-semibold text-white focus:outline-none"
        >
          {Object.keys(hierarchy).map(ward => (
            <option key={ward} value={ward} className="bg-gray-900">{ward}</option>
          ))}
        </select>
      </div>

      <ChevronRight size={20} className="text-gray-600" />

      {/* Area Selection */}
      <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
        <Grid size={16} className="text-purple-400" />
        <select 
          value={selectedArea || ""} 
          onChange={(e) => handleAreaChange(e.target.value)}
          className="bg-transparent text-sm font-semibold text-white focus:outline-none"
        >
          {selectedWard && Object.keys(hierarchy[selectedWard]).map(area => (
            <option key={area} value={area} className="bg-gray-900">{area}</option>
          ))}
        </select>
      </div>

      <ChevronRight size={20} className="text-gray-600" />

      {/* Feeder/Pole Selection */}
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
        <MapPin size={16} className="text-emerald-400" />
        <select 
          value={selectedFeeder || ""} 
          onChange={(e) => handleFeederChange(e.target.value)}
          className="bg-transparent text-sm font-semibold text-white focus:outline-none"
        >
          {selectedArea && hierarchy[selectedWard][selectedArea].map(feeder => (
            <option key={feeder} value={feeder} className="bg-gray-900">Pole/Feeder: {feeder}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
