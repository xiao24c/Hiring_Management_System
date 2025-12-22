import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Alert, Spin, Button } from "antd";
import { useNavigate } from "react-router-dom";

import useOnboarding from "../../../hooks/useOnboarding";
import OnboardingForm from "../../../components/Onboarding/OnboardingForm";
import { logout } from "../../../store/authSlice";

export default function OnboardingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const {
    status,
    error,
    onboardingStatus,
    data,
    loadOnboarding,
  } = useOnboarding();

  useEffect(() => {
    loadOnboarding();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  /* =========================
     Loading
  ========================== */
  if (status === "loading" && !onboardingStatus) {
    return (
      <div style={{ marginTop: 80, textAlign: "center" }}>
        <Spin />
      </div>
    );
  }

  /* =========================
     Error
  ========================== */
  if (error) {
    return (
      <Card
        style={{ maxWidth: 900, margin: "40px auto" }}
        extra={<Button onClick={handleLogout}>Logout</Button>}
      >
        <Alert type="error" message={error} />
      </Card>
    );
  }

  const email = user?.email || "";
  const username = user?.username || "";

  /* =========================
     Approved（理论上路由已拦）
  ========================== */
  if (onboardingStatus === "approved") {
    return (
      <Card
        style={{ maxWidth: 900, margin: "40px auto" }}
        extra={<Button onClick={handleLogout}>Logout</Button>}
      >
        <Alert
          type="success"
          showIcon
          message="Your onboarding has already been approved."
        />
      </Card>
    );
  }

  /* =========================
     Main Form (ALL other cases)
  ========================== */
  return (
    <Card
      title={`Employee Onboarding — ${username}`}
      style={{ maxWidth: 1000, margin: "40px auto" }}
      extra={<Button onClick={handleLogout}>Logout</Button>}
    >
      <OnboardingForm
        mode={onboardingStatus}   // ⭐ 核心：直接传状态
        initialData={data}
        userEmail={email}
      />
    </Card>
  );
}
