import { io } from "socket.io-client";

const URL =
  import.meta.env.VITE_API_URL ||
  "https://real-time-collab-backend.onrender.com";

export const socket = io(URL, {
  transports: ["websocket"]
});