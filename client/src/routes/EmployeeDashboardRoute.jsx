import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function EmployeeDashboardRoute({ children }) {
  const { user, token } = useSelector((s) => s.auth);

  // 未登录
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // /me 还没回来
  if (!user) {
    return null; // 或 Loading
  }

  // 不是 employee
  if (user.role !== "employee") {
    return <Navigate to="/login" replace />;
  }

  // onboarding 未通过 → 去 onboarding
  if (user.onboardingStatus !== "approved") {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
