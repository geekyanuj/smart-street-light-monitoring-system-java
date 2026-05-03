import { sendCommand } from "../api/deviceApi";
import { useNavigate } from "react-router-dom";

export default function DeviceCard({ device, refresh }) {
  const navigate = useNavigate();
  const toggleLight = async (e) => {
    e.stopPropagation();
    const newCommand = device.status === "ON" ? "TURN_OFF" : "TURN_ON";
    await sendCommand(device.deviceId, newCommand);
    refresh();
  };

  const goToDetails = () => {
    navigate(`/device/${device.deviceId}`);
  };

  return (
    <div
      className="bg-gray-800 rounded-lg shadow p-5 flex flex-col gap-2 hover:scale-[1.02] transition cursor-pointer"
      onClick={goToDetails}
      title="View details"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-blue-300">{device.deviceId}</h3>
        <span
          className={
            device.status === "ON"
              ? "px-2 py-1 rounded text-xs bg-green-600 text-white"
              : "px-2 py-1 rounded text-xs bg-gray-600 text-white"
          }
        >
          {device.status}
        </span>
      </div>
      <p className="text-gray-400 text-sm">📍 {device.location}</p>
      <button
        onClick={toggleLight}
        className={
          device.status === "ON"
            ? "mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            : "mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        }
      >
        {device.status === "ON" ? "Turn OFF" : "Turn ON"}
      </button>
    </div>
  );
}
