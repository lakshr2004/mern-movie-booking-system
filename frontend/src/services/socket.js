import { io } from "socket.io-client";

let socket = null;

export const connectSocket = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  if (!token) return null;

  socket = io("http://localhost:5000", {
    auth: { token },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });

  return socket;
};

export const getSocket = () => socket;

/**
 * Join show room for real-time seat updates
 */
export const joinShow = (showId) => {
  if (socket) {
    socket.emit("join-show", showId);
    console.log(`Joined show room: show-${showId}`);
  } else {
    console.warn("Socket not connected");
  }
};
