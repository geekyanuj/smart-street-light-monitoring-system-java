import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/sslms",
});

API.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem("auth"));
  if (auth && auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

// Device Management
export const getDevices = () => API.get("/devices");
export const getDevice = (id) => API.get(`/devices/${id}`);
export const createDevice = (device) => API.post("/devices", device);
export const updateDevice = (id, updates) => API.patch(`/devices/${id}`, updates);
export const deleteDevice = (id) => API.delete(`/devices/${id}`);

// Street Light Operations
export const sendCommand = (deviceId, command) =>
  API.post(`/devices/${deviceId}/control`, null, { params: { command } });

export const broadcastCommand = (command) =>
  API.post("/devices/broadcast", null, { params: { command } });

export const getLatestTelemetry = (deviceId) =>
  API.get(`/devices/${deviceId}/latest`);

export const syncNow = (deviceId) =>
  API.post(`/devices/${deviceId}/syncnow`);

export const getHistory = (deviceId) =>
  API.get(`/devices/${deviceId}/history`);

export const getGlobalLog = () =>
  API.get("/devices/telemetry/log");

export default API;