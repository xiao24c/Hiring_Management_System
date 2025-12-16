// src/pages/Employee/Dashboard/Visa/VisaPage.jsx
import { Card, Spin, Alert } from "antd";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchVisaStatus } from "../../../../store/visaSlice";
import VisaStepCard from "./VisaStepCard";

export default function VisaPage() {
  const dispatch = useDispatch();
  const { status, error, steps, activeStep } = useSelector((s) => s.visa);

  useEffect(() => {
    dispatch(fetchVisaStatus());
  }, []);

  if (status === "loading" || !steps) {
    return (
      <div style={{ marginTop: 120, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  return (
    <Card
      title="Visa Management (F-1)"
      style={{ maxWidth: 900, margin: "0 auto" }}
    >
      {["optReceipt", "optEAD", "i983", "i20"].map((key) => (
        <VisaStepCard
          key={key}
          stepKey={key}
          title={key.toUpperCase()}
          step={steps[key]}
          isActive={activeStep === key}
        />
      ))}
    </Card>
  );
}