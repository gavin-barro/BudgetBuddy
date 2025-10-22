// src/api/apiClient.js
import axios from "axios";

// Prefer env var; fall back to local dev server
const baseURL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:8080";

const api = axios.create({ baseURL });

// Attach JWT if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bb_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional: centralize 401 handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // If your app wants to auto-logout on 401s:
      // localStorage.removeItem("bb_token");
      // localStorage.removeItem("bb_current_user");
      // window.location.reload();
    }
    return Promise.reject(err);
  }
);

export default api;
