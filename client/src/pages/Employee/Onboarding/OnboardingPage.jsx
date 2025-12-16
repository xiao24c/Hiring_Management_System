// src/pages/Employee/Onboarding/OnboardingPage.jsx
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, Alert, Spin } from "antd";

import useOnboarding from "../../../hooks/useOnboarding";
import OnboardingForm from "../../../components/Onboarding/OnboardingForm";

export default function OnboardingPage() {
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
      <Card style={{ maxWidth: 900, margin: "40px auto" }}>
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
      <Card style={{ maxWidth: 900, margin: "40px auto" }}>
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
    >
      <OnboardingForm
        mode={onboardingStatus}   // ⭐ 核心：直接传状态
        initialData={data}
        userEmail={email}
      />
    </Card>
  );
}