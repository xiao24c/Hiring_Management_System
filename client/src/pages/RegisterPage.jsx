import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api.js";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialEmail = useMemo(() => searchParams.get("email") || "", [searchParams]);
  const initialToken = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [form, setForm] = useState({
    username: "",
    email: initialEmail,
    password: "",
    confirmPassword: "",
    token: initialToken
  });
  const [status, setStatus] = useState({ type: null, message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: null, message: "" });
    if (form.password !== form.confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/register", {
        username: form.username,
        email: form.email,
        password: form.password,
        token: form.token
      });
      setStatus({
        type: "success",
        message: "Registration successful. You can log in now."
      });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Registration failed."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="page-card" style={{ maxWidth: 540, margin: "3rem auto" }}>
        <h1 className="page-title">Employee Registration</h1>
        <p className="helper-text">
          Enter the registration token and email address that HR sent you. Without it you cannot
          register an account.
        </p>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="token">Registration Token</label>
            <input
              id="token"
              name="token"
              value={form.token}
              onChange={handleChange}
              placeholder="Paste the token from email"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Corporate Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="firstname.lastname@company.com"
            />
          </div>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              placeholder="jdoe"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          {status.message && (
            <p style={{ color: status.type === "error" ? "#b91c1c" : "#15803d" }}>{status.message}</p>
          )}
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Submitting..." : "Register"}
          </button>
        </form>
        <p className="helper-text" style={{ marginTop: "1rem" }}>
          Already registered? <Link to="/login">Go to login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
