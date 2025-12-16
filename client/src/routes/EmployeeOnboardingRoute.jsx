// src/routes/EmployeeOnboardingRoute.jsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function EmployeeOnboardingRoute({ children }) {
  const { user, token } = useSelector((s) => s.auth);
  console.log("🧭 EmployeeOnboardingRoute user =", user);

  // 未登录 → 登录页
  if (!token) {
    console.log("→ no token, redirect login");
    return <Navigate to="/login" replace />;
  }

  // 仍在加载 /me → 显示 loading，而不是 null！
  if (!user) {
    console.log("→ user null, showing loading");
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        Loading...
      </div>
    );
  }

  // HR 不允许访问此路由
  if (user.role === "hr") {
    return <Navigate to="/hr" replace />;
  }

  // onboarding 已完成 → 自动跳 Dashboard
  if (user.onboardingStatus === "approved") {
    return <Navigate to="/dashboard" replace />;
  }

  // 可以访问 Onboarding 页面
  return children;
}