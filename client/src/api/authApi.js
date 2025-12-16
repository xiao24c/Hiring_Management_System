import api from "./axiosInstance";

export const loginRequest = (credentials) =>
  api.post("/auth/login", credentials);

export const getCurrentUser = () =>
  api.get("/auth/me");