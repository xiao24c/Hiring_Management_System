import { createSlice } from "@reduxjs/toolkit";
import api, { setAuthToken } from "../services/api.js";

const TOKEN_KEY = "hiring_portal_token";
const isBrowser = typeof window !== "undefined";

const readStoredToken = () => {
  if (!isBrowser) return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("Unable to read auth token from storage", error);
    return null;
  }
};

const writeStoredToken = (value) => {
  if (!isBrowser) return;
  try {
    if (value) {
      window.localStorage.setItem(TOKEN_KEY, value);
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  } catch (error) {
    console.error("Unable to persist auth token", error);
  }
};

const initialToken = readStoredToken();
if (initialToken) {
  setAuthToken(initialToken);
}

const initialState = {
  token: initialToken,
  user: null,
  employeeProfile: null,
  loading: true,
  error: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    startAuth(state) {
      state.loading = true;
      state.error = null;
    },
    authSuccess(state, action) {
      const { token = null, user = null, profile = null } = action.payload || {};
      state.token = token;
      state.user = user;
      state.employeeProfile = profile;
      state.loading = false;
      state.error = null;
    },
    authFailure(state, action) {
      state.loading = false;
      state.error = action.payload || null;
      state.token = null;
      state.user = null;
      state.employeeProfile = null;
    },
    profileUpdated(state, action) {
      state.employeeProfile = action.payload;
    },
    logoutComplete(state) {
      state.token = null;
      state.user = null;
      state.employeeProfile = null;
      state.loading = false;
      state.error = null;
    }
  }
});

const { startAuth, authSuccess, authFailure, profileUpdated, logoutComplete } = authSlice.actions;

const loadEmployeeProfile = async (dispatch) => {
  try {
    const { data } = await api.get("/employee/profile");
    dispatch(profileUpdated(data));
    return data;
  } catch (error) {
    console.error("Failed to fetch profile", error);
    dispatch(profileUpdated(null));
    return null;
  }
};

export const initializeAuth = () => async (dispatch) => {
  dispatch(startAuth());
  const storedToken = readStoredToken();
  if (!storedToken) {
    setAuthToken(null);
    dispatch(authSuccess({ token: null, user: null, profile: null }));
    return { user: null, profile: null };
  }

  try {
    setAuthToken(storedToken);
    const { data } = await api.get("/auth/me");
    const profile = await loadEmployeeProfile(dispatch);
    dispatch(authSuccess({ token: storedToken, user: data, profile }));
    return { user: data, profile };
  } catch (error) {
    writeStoredToken(null);
    setAuthToken(null);
    dispatch(authFailure(error.response?.data?.message || "Authentication failed."));
    return null;
  }
};

export const login =
  (credentials) =>
  async (dispatch) => {
    const { data } = await api.post("/auth/login", credentials);
    writeStoredToken(data.token);
    setAuthToken(data.token);
    const profile = await loadEmployeeProfile(dispatch);
    dispatch(authSuccess({ token: data.token, user: data.user, profile }));
    return { user: data.user, profile };
  };

export const refreshEmployeeProfile = () => async (dispatch) => loadEmployeeProfile(dispatch);

export const logout = () => (dispatch) => {
  writeStoredToken(null);
  setAuthToken(null);
  dispatch(logoutComplete());
};

export default authSlice.reducer;
