import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDevice, sendCommand } from "../api/deviceApi";

export default function DeviceDetails() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [device, setDevice] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const fetchDevice = async () => {
		setLoading(true);
		try {
			const res = await getDevice(id);
			setDevice(res.data);
			setError("");
		} catch (err) {
			setError("Device not found");
			setDevice(null);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchDevice();
		// Optionally poll for updates
		// const interval = setInterval(fetchDevice, 5000);
		// return () => clearInterval(interval);
	}, [id]);

	const handleToggle = async () => {
		if (!device) return;
		const newCommand = device.status === "ON" ? "TURN_OFF" : "TURN_ON";
		await sendCommand(device.deviceId, newCommand);
		fetchDevice();
	};

	if (loading) return <div className="text-gray-400">Loading...</div>;
	if (error) return <div className="text-red-500">{error}</div>;
	if (!device) return null;

	return (
		<div className="max-w-xl mx-auto bg-gray-900 text-white p-8 rounded shadow">
			<button onClick={() => navigate(-1)} className="mb-4 text-blue-400 hover:underline">&larr; Back</button>
			<h2 className="text-2xl font-bold mb-2">Device {device.deviceId}</h2>
			<p className="text-gray-400 mb-2">Location: {device.location}</p>
			<p className="mb-2">
				Status: <span className={device.status === "ON" ? "text-green-400" : "text-yellow-400"}>{device.status}</span>
			</p>
			<button
				onClick={handleToggle}
				className={
					device.status === "ON"
						? "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
						: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
				}
			>
				{device.status === "ON" ? "Turn OFF" : "Turn ON"}
			</button>
		</div>
	);
}
