import { useEffect } from "react";
import { Card, Spin, Alert, Divider, Form, Button } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchEmployeeDetail } from "../../../../store/hrEmployeeSlice";

import BasicInfoSection from "../../../../components/Onboarding/BasicInfoSection";
import ProfilePictureSection from "../../../../components/Onboarding/ProfilePictureSection";
import AddressSection from "../../../../components/Onboarding/AddressSection";
import ContactSection from "../../../../components/Onboarding/ContactSection";
import LegalSection from "../../../../components/Onboarding/LegalSection";
import WorkAuthorizationSection from "../../../../components/Onboarding/WorkAuthorizationSection";
import ReferenceSection from "../../../../components/Onboarding/ReferenceSection";
import EmergencyContactsSection from "../../../../components/Onboarding/EmergencyContactsSection";
import FileSummarySection from "../../../../components/Onboarding/FileSummarySection";

export default function EmployeeDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const { status, error, employee } = useSelector(
    (s) => s.hrEmployees.detail
  );

  useEffect(() => {
    dispatch(fetchEmployeeDetail(userId));
  }, [dispatch, userId]);

  useEffect(() => {
    if (employee?.onboarding) {
      form.setFieldsValue(employee.onboarding);
    }
  }, [employee, form]);

  if (status === "loading" || !employee) {
    return (
      <div style={{ marginTop: 120, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Card style={{ maxWidth: 900, margin: "40px auto" }}>
        <Alert type="error" message={error} />
      </Card>
    );
  }

  const { user, onboarding } = employee;

  return (
    <Card
      title={`Employee Profile — ${onboarding?.name?.firstName || ""} ${onboarding?.name?.lastName || ""}`}
      style={{ maxWidth: 1000, margin: "24px auto" }}
      extra={
        <Button onClick={() => navigate("/hr/employees")}>
          Back to Employees
        </Button>
      }
    >
      {!onboarding && (
        <Alert
          type="warning"
          message="This employee has not completed onboarding yet."
          style={{ marginBottom: 16 }}
        />
      )}

      {onboarding && (
        <Form layout="vertical" form={form} disabled>
          <BasicInfoSection readOnly />
          <Divider />

          <ProfilePictureSection readOnly />
          <Divider />

          <AddressSection readOnly />
          <Divider />

          <ContactSection readOnly userEmail={user.email} />
          <Divider />

          <LegalSection readOnly />
          <Divider />

          <WorkAuthorizationSection readOnly />
          <Divider />

          <ReferenceSection readOnly />
          <Divider />

          <EmergencyContactsSection readOnly />

          <Divider />

          <FileSummarySection onboardingData={onboarding} />
        </Form>
      )}
    </Card>
  );
}
