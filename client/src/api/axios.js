import axios from "axios";

// In production set VITE_API_URL to the deployed Render URL, e.g.
// https://bloom-api.onrender.com/api
const baseURL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL,
  withCredentials: true, // send/receive the httpOnly auth cookie
});

// Also attach a bearer token if we have one cached (fallback for
// environments where third-party cookies are blocked).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bloom_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
