import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/authSlice";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button } from "antd";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((s) => s.auth);
  
  const onFinish = (values) => {
    dispatch(login(values));
  };

  useEffect(() => {
    if (!user) return;

    // HR → HR dashboard（以后你再实现 /hr）
    if (user.role === "hr") {
      navigate("/hr");
      return;
    }

    // Employee：先看 onboardingStatus
    if (user.onboardingStatus !== "approved") {
      // not_submitted / pending / rejected
      navigate("/onboarding");
      return;
    }

    // Employee + onboarding 已通过 → Employee Dashboard
    navigate("/dashboard");
  }, [user, navigate]);

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 80 }}>
      <Card title="Login" style={{ width: 380 }}>
        <Form onFinish={onFinish}>
          <Form.Item name="username" rules={[{ required: true }]}>
            <Input placeholder="Username" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true }]}>
            <Input.Password placeholder="Password" />
          </Form.Item>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <Button type="primary" htmlType="submit" loading={loading} block>
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
}
