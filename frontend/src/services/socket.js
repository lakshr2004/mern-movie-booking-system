import { io } from "socket.io-client";

let socket = null;

const SOCKET_URL = import.meta.env.VITE_API_URL; // 🔥 IMPORTANT

export const connectSocket = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  if (!token) return null;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket error:", err.message);
  });

  return socket;
};

export const getSocket = () => socket;

export const joinShow = (showId) => {
  if (socket) {
    socket.emit("join-show", showId);
    console.log(`Joined show room: show-${showId}`);
  } else {
    console.warn("Socket not connected");
  }
};