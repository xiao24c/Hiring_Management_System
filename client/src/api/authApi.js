import api from "./axiosInstance";

export const loginRequest = (credentials) =>
  api.post("/auth/login", credentials);

export const getCurrentUser = () =>
  api.get("/auth/me");

export const validateRegisterToken = (token) =>
  api.get("/auth/validate-token", { params: { token } });

export const registerRequest = (payload) =>
  api.post("/auth/register", payload);
