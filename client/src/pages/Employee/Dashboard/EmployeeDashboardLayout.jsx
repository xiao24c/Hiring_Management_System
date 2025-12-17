// src/pages/Employee/Dashboard/EmployeeDashboardLayout.jsx
import { useEffect } from "react";
import { Layout, Menu, Spin } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";

import { logout } from "../../../store/authSlice";
import useOnboarding from "../../../hooks/useOnboarding";

const { Header, Content, Sider } = Layout;

export default function EmployeeDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);

  const { user } = useSelector((s) => s.auth);

  // 🔑 onboarding 来自 onboarding slice
  const {
    loadOnboarding,
    data: onboarding,
    status: onboardingStatus,
  } = useOnboarding();

  // 进入 dashboard 就加载 onboarding
  useEffect(() => {
    loadOnboarding();
  }, []);

  // onboarding 还没回来 → 不要渲染 menu
  if (!onboarding || onboardingStatus === "loading") {
    return (
      <div style={{ marginTop: 120, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  // ✅ 是否 F1（**一定用 onboarding，不要用 auth.user**）
  const isF1 =
    onboarding.visaInfo?.isCitizenOrPR === false &&
    onboarding.visaInfo?.workAuthorization === "F1";

  const menuItems = [
    {
      key: "/dashboard/personal",
      label: "Personal Info",
    },
    ...(isF1
      ? [
          {
            key: "/dashboard/visa",
            label: "Visa Management",
          },
        ]
      : []),
    {
      key: "logout",
      label: "Logout",
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      dispatch(logout());
      navigate("/login");
      return;
    }
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={240}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="md"
        collapsedWidth={64}
      >
        <div style={{ color: "#fff", padding: 16, fontWeight: 600 }}>
          Employee Portal
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout>
        <Header style={{ background: "#fff", paddingLeft: 24 }}>
          Welcome, {user?.username}
        </Header>

        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
