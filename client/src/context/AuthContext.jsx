import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import api, { setAuthToken } from "../services/api.js";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("hiring_portal_token"));
  const [user, setUser] = useState(null);
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get("/employee/profile");
      setEmployeeProfile(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch profile", error);
      return null;
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
        await fetchProfile();
      } catch (error) {
        console.error("Auth init failed", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [token, fetchProfile]);

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    localStorage.setItem("hiring_portal_token", data.token);
    setToken(data.token);
    setAuthToken(data.token);
    setUser(data.user);
    const profile = await fetchProfile();
    return { user: data.user, profile };
  };

  const logout = () => {
    localStorage.removeItem("hiring_portal_token");
    setToken(null);
    setAuthToken(null);
    setUser(null);
    setEmployeeProfile(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      employeeProfile,
      setEmployeeProfile,
      login,
      logout,
      refreshEmployeeProfile: fetchProfile,
      loading
    }),
    [token, user, employeeProfile, fetchProfile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
