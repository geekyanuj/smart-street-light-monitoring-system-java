import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { 
  Zap, 
  Clock, 
  MapPin, 
  Activity, 
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import L from "leaflet";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Custom Marker Icons
const createIcon = (color) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const blueIcon = createIcon('blue');
const goldIcon = createIcon('gold');
const redIcon = createIcon('red');

export default function MapView() {
  const [feeders, setFeeders] = useState([]);
  const [telemetryMap, setTelemetryMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const feedersRes = await axios.get(`${API_BASE}/api/feeders`);
        const feedersData = feedersRes.data;
        setFeeders(feedersData);

        // Fetch latest telemetry for each feeder
        const telemetryPromises = feedersData.map(f => 
          axios.get(`${API_BASE}/api/telemetry/latest?feederId=${f.feederId}`)
        );
        const telemetryResults = await Promise.all(telemetryPromises);
        
        const tMap = {};
        telemetryResults.forEach((res, idx) => {
          if (res.data) {
            tMap[feedersData[idx].feederId] = res.data;
          }
        });
        setTelemetryMap(tMap);
      } catch (err) {
        console.error("Error fetching map data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-white">Loading map...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            Geospatial Overview
          </h1>
          <p className="text-gray-400 mt-1">Real-time location and status of feeder nodes</p>
        </div>
        
        <div className="flex gap-4">
           <div className="flex items-center gap-2 text-xs text-gray-400">
             <div className="w-3 h-3 rounded-full bg-blue-500"></div> Active
           </div>
           <div className="flex items-center gap-2 text-xs text-gray-400">
             <div className="w-3 h-3 rounded-full bg-red-500"></div> Fault
           </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden h-[70vh] relative z-0">
        <MapContainer center={[23.785, 86.435]} zoom={14} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {feeders.map((f) => {
            const tel = telemetryMap[f.feederId];
            const isFaulty = tel && (tel.power < f.thresholds.minPower || tel.power > f.thresholds.maxPower);
            const icon = isFaulty ? redIcon : (tel ? blueIcon : goldIcon);

            return (
              <Marker key={f.feederId} position={[f.location.lat, f.location.lng]} icon={icon}>
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-blue-600 uppercase">Feeder Node</span>
                      <span className="text-lg font-bold">#{f.feederId}</span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={14} />
                        <span className="text-xs">{f.ward}, {f.area}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Activity size={14} />
                        <span className="text-xs">{f.poleCount} Poles Connected</span>
                      </div>
                    </div>

                    {tel ? (
                      <div className="bg-gray-50 p-3 rounded-xl space-y-2 border border-gray-100">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 font-medium">Power consumption</span>
                          <span className="font-bold text-gray-900">{tel.power.toFixed(1)} W</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 font-medium">Last update</span>
                          <span className="text-blue-600 font-semibold">{new Date(tel.timestamp).toLocaleTimeString()}</span>
                        </div>
                        {isFaulty && (
                          <div className="pt-1 flex items-center gap-1 text-[10px] text-red-500 font-bold uppercase">
                            <AlertTriangle size={10} />
                            Threshold Violation
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-400 text-xs bg-gray-50 rounded-xl">
                        Waiting for telemetry data...
                      </div>
                    )}

                    <button 
                      className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
                      onClick={() => window.location.href = `/?feederId=${f.feederId}`}
                    >
                      <ExternalLink size={12} />
                      View Full Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}