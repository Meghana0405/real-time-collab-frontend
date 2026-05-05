import axios from "axios";

// 🌐 Backend URL (from Vercel env OR fallback)
const BASE_URL =
  (import.meta.env.VITE_API_URL as string)?.replace(/\/$/, "") ||
  "https://real-time-collab-backend.onrender.com";

// 🚀 Axios instance
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true,
  timeout: 15000 // ⏱ prevents hanging if backend sleeps
});

// 🔐 Attach token + log full request URL
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Safe logging
    const fullURL = `${config.baseURL || ""}${config.url || ""}`;
    console.log("🌐 API CALL →", fullURL);

    return config;
  },
  (error) => Promise.reject(error)
);

// ⚠️ Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.response?.data ||
      error.message;

    console.error("🚨 API Error:", status, message);

    // 🌙 Backend sleeping (Render)
    if (error.code === "ERR_NETWORK") {
      alert("⚠️ Backend is waking up... try again in 20–30 seconds");
    }

    // 🔐 Token expired
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);