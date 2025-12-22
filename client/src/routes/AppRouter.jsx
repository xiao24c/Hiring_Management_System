import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage/LoginPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";

import EmployeeDashboardRoute from "./EmployeeDashboardRoute";
import EmployeeOnboardingRoute from "./EmployeeOnboardingRoute";
import HRDashboardRoute from "./HRDashboardRoute";

import OnboardingPage from "../pages/Employee/Onboarding/OnboardingPage";
import EmployeeDashboardLayout from "../pages/Employee/Dashboard/EmployeeDashboardLayout";
import PersonalInfoPage from "../pages/Employee/Dashboard/PersonalInfoPage";
import VisaPage from "../pages/Employee/Dashboard/Visa/VisaPage";
import StepDetail from "../pages/Employee/Dashboard/Visa/StepDetail";

import HRDashboardLayout from "../pages/HR/Dashboard/DashboardLayout";
import HRHomePage from "../pages/HR/Dashboard/HomePage";
import EmployeeListPage from "../pages/HR/Dashboard/Employees/EmployeeListPage";
import EmployeeDetailPage from "../pages/HR/Dashboard/Employees/EmployeeDetailPage";
import HRVisaListPage from "../pages/HR/Dashboard/Visa/HRVisaListPage";
import HRVisaDetailPage from "../pages/HR/Dashboard/Visa/HRVisaDetailPage";
import HiringManagementPage from "../pages/HR/Dashboard/Hiring/HiringManagementPage";
import OnboardingDetailPage from "../pages/HR/Dashboard/Hiring/OnboardingDetailPage";

export default function AppRouter() {
  return (
    <Routes>
      {/* 默认跳登录 */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 登录页 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* =====================
          Employee Onboarding
      ====================== */}
      <Route
        path="/onboarding"
        element={
          <EmployeeOnboardingRoute>
            <OnboardingPage />
          </EmployeeOnboardingRoute>
        }
      />

      {/* =====================
          Employee Dashboard
      ====================== */}
      <Route
        path="/dashboard"
        element={
          <EmployeeDashboardRoute>
            <EmployeeDashboardLayout />
          </EmployeeDashboardRoute>
        }
      >
        <Route index element={<Navigate to="personal" replace />} />
        <Route path="personal" element={<PersonalInfoPage />} />
        <Route path="visa" element={<VisaPage />} />
        <Route path="visa/:step" element={<StepDetail />} />
      </Route>

      {/* =====================
          HR Dashboard
      ====================== */}
      <Route
        path="/hr"
        element={
          <HRDashboardRoute>
            <HRDashboardLayout />
          </HRDashboardRoute>
        }
      >
        {/* HR Home */}
        <Route index element={<HRHomePage />} />

        {/* Employee Profiles */}
        <Route path="employees" element={<EmployeeListPage />} />
        <Route path="employees/:userId" element={<EmployeeDetailPage />} />

        {/* Visa Status Management */}
        <Route path="visa" element={<HRVisaListPage />} />
        <Route path="visa/:userId" element={<HRVisaDetailPage />} />

        {/* Hiring Management */}
        <Route path="hiring" element={<HiringManagementPage />} />
        <Route path="onboarding/:onboardingId" element={<OnboardingDetailPage />} />
      </Route>

      {/* 兜底 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
