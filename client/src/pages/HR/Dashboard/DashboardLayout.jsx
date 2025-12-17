import { Layout, Menu } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../../store/authSlice";
import { useState } from "react";

const { Sider, Header, Content } = Layout;

export default function HRDashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { key: "/hr", label: "Home" },
    { key: "/hr/employees", label: "Employee Profiles" },
    { key: "/hr/visa", label: "Visa Status Management" },
    { key: "/hr/hiring", label: "Hiring Management" },
    { key: "logout", label: "Logout", danger: true },
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
        breakpoint="md"        // ⭐ 关键
        collapsedWidth={64}    // ⭐ 手机下只留 icon 宽度
      >
        <div
          style={{
            color: "#fff",
            fontWeight: 600,
            padding: 16,
            textAlign: collapsed ? "center" : "left",
          }}
        >
          HR
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
          HR Dashboard
        </Header>

        <Content style={{ margin: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
