import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import PersonalInfoPage from "./pages/PersonalInfoPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import VisaStatusPage from "./pages/VisaStatusPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import HRLayout from "./components/HRLayout.jsx";
import { useAuth } from "./hooks/useAuth.js";
import HomePage from "./pages/hr/HomePage.jsx";
import EmployeeDirectoryPage from "./pages/hr/EmployeeDirectoryPage.jsx";
import VisaManagementPage from "./pages/hr/VisaManagementPage.jsx";
import HiringManagementPage from "./pages/hr/HiringManagementPage.jsx";
import EmployeeProfileView from "./pages/hr/EmployeeProfileView.jsx";
import OnboardingApplicationView from "./pages/hr/OnboardingApplicationView.jsx";

const EmployeeRoutes = () => {
  const { employeeProfile } = useAuth();
  const onboardingStatus = employeeProfile?.onboardingStatus || "never_submitted";
  const requiresOnboarding = onboardingStatus !== "approved";

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to={requiresOnboarding ? "/onboarding" : "/personal-info"} replace />} />
        <Route path="/personal-info" element={<PersonalInfoPage />} />
        <Route path="/visa-status" element={<VisaStatusPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/personal-info" replace />} />
    </Routes>
  );
};

const HRRoutes = () => (
  <Routes>
    <Route element={<HRLayout />}>
      <Route path="/" element={<Navigate to="/hr" replace />} />
      <Route path="/hr" element={<HomePage />} />
      <Route path="/hr/employees" element={<EmployeeDirectoryPage />} />
      <Route path="/hr/employees/:id" element={<EmployeeProfileView />} />
      <Route path="/hr/visa" element={<VisaManagementPage />} />
      <Route path="/hr/hiring" element={<HiringManagementPage />} />
      <Route path="/hr/onboarding/:userId" element={<OnboardingApplicationView />} />
    </Route>
    <Route path="*" element={<Navigate to="/hr" replace />} />
  </Routes>
);

const RoleRouter = () => {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === "hr" ? <HRRoutes /> : <EmployeeRoutes />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route
      path="/*"
      element={
        <ProtectedRoute>
          <RoleRouter />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);

export default App;
