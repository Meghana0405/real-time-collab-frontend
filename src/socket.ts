import { io } from "socket.io-client";

export const socket = io(
  "https://real-time-collab-backend.onrender.com",
  {
    transports: ["websocket"]
  }
);