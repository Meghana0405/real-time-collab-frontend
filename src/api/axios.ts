import axios from "axios";

// 🌐 Backend URL (Vercel env OR fallback)
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://real-time-collab-backend.onrender.com";

// 🚀 Axios instance
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// 🔐 Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ⚠️ Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data || error.message;

    console.error("🚨 API Error:", status, message);

    // 🔐 Auto logout if unauthorized
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);