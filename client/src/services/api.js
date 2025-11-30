import axios from "axios";

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: baseUrl,
  withCredentials: false
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const getAssetUrl = (path) => {
  if (!path) return null;
  const apiOrigin = baseUrl.replace(/\/$/, "").replace(/\/api$/, "");
  return `${apiOrigin}${path}`;
};

export default api;
