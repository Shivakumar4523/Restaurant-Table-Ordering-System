import { io } from "socket.io-client";

export const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export function createSocket() {
  return io(socketUrl, {
    autoConnect: true,
    transports: ["websocket", "polling"]
  });
}
