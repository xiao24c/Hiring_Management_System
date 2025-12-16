// src/routes/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage/LoginPage";

import EmployeeDashboardRoute from "./EmployeeDashboardRoute";
import EmployeeOnboardingRoute from "./EmployeeOnboardingRoute";
import HRDashboardRoute from "./HRDashboardRoute";

import OnboardingPage from "../pages/Employee/Onboarding/OnboardingPage";
import EmployeeDashboardLayout from "../pages/Employee/Dashboard/EmployeeDashboardLayout";
import PersonalInfoPage from "../pages/Employee/Dashboard/PersonalInfoPage";
import VisaPage from "../pages/Employee/Dashboard/Visa/VisaPage";
import StepDetail from "../pages/Employee/Dashboard/Visa/StepDetail";

import HRDashboardLayout from "../pages/HR/Dashboard/DashboardLayout";
import EmployeeListPage from "../pages/HR/Dashboard/Employees/EmployeeListPage";
import HRVisaListPage from "../pages/HR/Dashboard/Visa/HRVisaListPage";
import HRVisaDetailPage from "../pages/HR/Dashboard/Visa/HRVisaDetailPage";
import HiringManagementPage from "../pages/HR/Dashboard/Hiring/HiringManagementPage";

export default function AppRouter() {
  return (
    <Routes>
      {/* 默认跳登录 */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 登录页 */}
      <Route path="/login" element={<LoginPage />} />

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
        {/* 默认 → Employee Profiles */}
        <Route index element={<Navigate to="employees" replace />} />

        {/* Employee Profiles */}
        <Route path="employees" element={<EmployeeListPage />} />

        {/* Visa Status Management */}
        <Route path="visa" element={<HRVisaListPage />} />
        <Route path="visa/:userId" element={<HRVisaDetailPage />} />

        {/* Hiring Management */}
        <Route path="hiring" element={<HiringManagementPage />} />
      </Route>

      {/* 兜底 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}