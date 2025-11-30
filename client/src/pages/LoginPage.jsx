import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { user: loggedUser, profile } = await login(form);
      if (loggedUser.role === "hr") {
        navigate("/hr", { replace: true });
      } else {
        const onboardingStatus = profile?.onboardingStatus;
        const needsOnboarding = onboardingStatus !== "approved";
        navigate(needsOnboarding ? "/onboarding" : "/personal-info", { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="page-card" style={{ maxWidth: 480, margin: "4rem auto" }}>
        <h1 className="page-title">Employee Login</h1>
        <form className="form-grid" onSubmit={handleSubmit}>
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
          {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="helper-text" style={{ marginTop: "1rem" }}>
          Need an account? Ask HR for a registration link or <Link to="/register">use your token here</Link>.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
