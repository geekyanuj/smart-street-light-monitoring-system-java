import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { 
  Zap, 
  MapPin, 
  Activity, 
  AlertTriangle,
  ExternalLink,
  Navigation
} from "lucide-react";
import L from "leaflet";
import { getDevices, getLatestTelemetry } from "../api/deviceApi";

// Dhanbad Center
const DHANBAD_CENTER = [23.7957, 86.4304];

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

// Helper to generate a consistent simulated coordinate for devices without GPS
// This spreads them slightly around Dhanbad center based on their ID
const getSimulatedCoords = (deviceId, area) => {
    // Hash function to get consistent offset
    let hash = 0;
    for (let i = 0; i < deviceId.length; i++) {
        hash = deviceId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const latOffset = (hash % 100) / 2000; // Small spread
    const lngOffset = ((hash >> 8) % 100) / 2000;
    
    return [DHANBAD_CENTER[0] + latOffset, DHANBAD_CENTER[1] + lngOffset];
};

export default function MapView() {
  const [devices, setDevices] = useState([]);
  const [telemetryMap, setTelemetryMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const devRes = await getDevices();
        const devData = devRes.data;
        setDevices(devData);

        // Fetch latest telemetry for each device
        const telemetryPromises = devData.map(d => 
          getLatestTelemetry(d.deviceId).catch(() => ({ data: null }))
        );
        const telemetryResults = await Promise.all(telemetryPromises);
        
        const tMap = {};
        telemetryResults.forEach((res, idx) => {
          if (res.data) {
            tMap[devData[idx].deviceId] = res.data;
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

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold tracking-widest text-xs">INITIALIZING MAP...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Geospatial Overview
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm">
            <Navigation size={14} className="text-blue-500" />
            Monitoring Dhanbad Municipal Area
          </p>
        </div>
        
        <div className="flex gap-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
             <div className="w-3 h-3 rounded-full bg-blue-500"></div> Nominal
           </div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
             <div className="w-3 h-3 rounded-full bg-red-500"></div> Fault
           </div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
             <div className="w-3 h-3 rounded-full bg-yellow-500"></div> Offline
           </div>
        </div>
      </div>

      <div className="standard-card overflow-hidden h-[70vh] relative z-0">
        <MapContainer center={DHANBAD_CENTER} zoom={14} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {devices.map((d) => {
            const tel = telemetryMap[d.deviceId];
            const isFaulty = tel && (tel.power > d.baselineWatt * 1.3 || (tel.power < d.baselineWatt * 0.7 && tel.power > 5));
            const icon = isFaulty ? redIcon : (tel ? blueIcon : goldIcon);
            
            const position = (d.latitude && d.longitude) 
                ? [d.latitude, d.longitude] 
                : getSimulatedCoords(d.deviceId, d.area);

            return (
              <Marker key={d.deviceId} position={position} icon={icon}>
                <Popup className="custom-popup">
                  <div className="p-4 min-w-[240px] bg-white text-slate-900 rounded-xl shadow-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Street Node</span>
                      <span className="text-sm font-bold">#{d.deviceId}</span>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-2 text-slate-600">
                        <MapPin size={14} className="text-slate-400 mt-0.5" />
                        <span className="text-xs font-semibold">{d.landmark}, {d.area}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Activity size={14} className="text-slate-400" />
                        <span className="text-xs font-semibold">Ward No: {d.wardNo}</span>
                      </div>
                    </div>

                    {tel ? (
                      <div className="bg-slate-50 p-4 rounded-lg space-y-3 border border-slate-100">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Power</span>
                          <span className="text-sm font-bold text-slate-900">{tel.power.toFixed(1)} W</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Voltage</span>
                          <span className="text-sm font-bold text-slate-900">{tel.voltage.toFixed(1)} V</span>
                        </div>
                        {isFaulty && (
                          <div className="pt-2 flex items-center gap-2 text-[10px] text-red-600 font-bold uppercase tracking-widest">
                            <AlertTriangle size={12} />
                            Critical Fault
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        No Telemetry Data
                      </div>
                    )}

                    <button 
                      className="w-full mt-4 btn-primary py-2.5 flex items-center justify-center gap-2 text-xs"
                      onClick={() => window.location.href = `/?deviceId=${d.deviceId}`}
                    >
                      <ExternalLink size={14} />
                      CONTROL NODE
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