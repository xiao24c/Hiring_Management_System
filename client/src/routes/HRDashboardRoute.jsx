// src/routes/HRDashboardRoute.jsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function HRDashboardRoute({ children }) {
  const { user, token } = useSelector((s) => s.auth);

  // 未登录
  if (!token) return <Navigate to="/login" replace />;

  // 正在加载 /me
  if (!user) return null;

  // 不是 HR → 不允许访问
  if (user.role !== "hr") {
    return <Navigate to="/login" replace />;
  }

  return children;
}