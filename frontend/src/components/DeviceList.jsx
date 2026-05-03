import DeviceCard from "./DeviceCard";

export default function DeviceList({ devices, refresh }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {devices.map((d) => (
        <DeviceCard key={d.deviceId} device={d} refresh={refresh} />
      ))}
    </div>
  );
}