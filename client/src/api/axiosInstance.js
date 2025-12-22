import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5050/api",
});

// 每次请求自动把 token 放进 header
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default instance;