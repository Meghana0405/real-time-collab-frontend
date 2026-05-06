import { io } from "socket.io-client";

const URL =
  (import.meta.env.VITE_API_URL as string)?.replace(/\/$/, "") ||
  "https://real-time-collab-backend.onrender.com";

export const socket = io(URL, {
  withCredentials: true,
  transports: ["websocket"],
  autoConnect: true
});

// Debug (optional)
socket.on("connect", () => {
  console.log("🟢 Connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("🔴 Disconnected");
});