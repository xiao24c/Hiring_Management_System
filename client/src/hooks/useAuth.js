import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login as loginThunk, logout as logoutThunk, refreshEmployeeProfile as refreshEmployeeProfileThunk } from "../store/authSlice.js";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { token, user, employeeProfile, loading } = useSelector((state) => state.auth);

  const login = useCallback((credentials) => dispatch(loginThunk(credentials)), [dispatch]);
  const logout = useCallback(() => dispatch(logoutThunk()), [dispatch]);
  const refreshEmployeeProfile = useCallback(() => dispatch(refreshEmployeeProfileThunk()), [dispatch]);

  return { token, user, employeeProfile, loading, login, logout, refreshEmployeeProfile };
};
