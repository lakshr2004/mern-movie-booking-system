import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
});

// 🔐 Get token from localStorage
const getToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.token || null;
  } catch {
    return null;
  }
};

// 🔐 Attach token automatically
API.interceptors.request.use((req) => {
  const token = getToken();
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// 🚫 Auto logout if token invalid
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

//
// 🎬 SHOW APIs
//
export const getShowSeats = (showId) =>
  API.get(`/shows/${showId}`);

//
// 🎟️ BOOKING APIs
//
export const lockSeats = (showId, seats) =>
  API.post("/booking/lock", { showId, seats });

export const unlockSeats = (showId, seats) =>
  API.post("/booking/unlock", { showId, seats });

export const bookSeats = (showId, seats) =>
  API.post("/booking/book", { showId, seats });

export default API;