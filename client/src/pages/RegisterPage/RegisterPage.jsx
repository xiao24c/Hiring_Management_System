import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Card, Form, Input, Button, Alert, Spin, message } from "antd";
import { registerRequest, validateRegisterToken } from "../../api/authApi";
import { logout } from "../../store/authSlice";

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = searchParams.get("token");

  const [form] = Form.useForm();
  const [email, setEmail] = useState("");
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setError("Missing token");
        setValidating(false);
        return;
      }

      try {
        const res = await validateRegisterToken(token);
        setEmail(res.data.email);
        form.setFieldsValue({ email: res.data.email });
        setError(null);
      } catch (err) {
        setError(err.response?.data?.msg || "Invalid or expired token");
      } finally {
        setValidating(false);
      }
    };

    run();
  }, [token]);

  const onFinish = async (values) => {
    try {
      await registerRequest({
        token,
        username: values.username,
        password: values.password,
      });
      message.success("Registration successful, please login");
      dispatch(logout());
      navigate("/login");
    } catch (err) {
      message.error(err.response?.data?.msg || "Registration failed");
    }
  };

  if (validating) {
    return (
      <div style={{ marginTop: 120, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: 80 }}>
        <Card title="Registration">
          <Alert type="error" message={error} />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 60 }}>
      <Card title="Register" style={{ width: 420 }}>
        <Form layout="vertical" onFinish={onFinish} form={form}>
          <Form.Item label="Email" name="email">
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Username is required" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Password is required" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirm"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Register
          </Button>
        </Form>
      </Card>
    </div>
  );
}
