import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/sslms";

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, credentials);
    return { success: true, ...response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Invalid credentials or server error"
    };
  }
};

export const setupAdmin = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/setup`, credentials);
    return { success: true, message: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data || "Setup failed" };
  }
};