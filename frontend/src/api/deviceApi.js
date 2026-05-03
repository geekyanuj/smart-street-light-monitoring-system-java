import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Get all devices
export const getDevices = () => API.get("/devices");

// Get single device
export const getDevice = (id) => API.get(`/devices/${id}`);

// Send command (ON/OFF)
export const sendCommand = (deviceId, command) =>
  API.post("/device/command", { deviceId, command });

export default API;