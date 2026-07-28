import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRightToBracket } from "react-icons/fa6";
import { dashboardPathForRole } from "../../constants/roles";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../layouts/AuthLayout";
import api from "../../services/api";
import PasswordInput from "../../components/common/PasswordInput";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const { data } = await api.post("/auth/login", form);
      if (!data?.token || !data?.user?.role) throw new Error("Unexpected sign-in response.");
      login({ token: data.token, user: data.user });
      navigate(dashboardPathForRole(data.user.role), { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      mode="login"
      title="Welcome back"
      subtitle="Sign in to manage bookings, wishlist, notifications, and customer rentals."
      footer={
        <>
          New to RentHub? <Link to="/register" className="auth-muted-link">Create an account</Link>
        </>
      }
    >
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <form onSubmit={submit} noValidate>
        <div className="mb-3">
          <label className="form-label fw-semibold" htmlFor="email">Email address</label>
          <input
            autoComplete="email"
            className="form-control"
            id="email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@company.com"
            required
            type="email"
            value={form.email}
          />
        </div>

        <PasswordInput
          autoComplete="current-password"
          id="password"
          label="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Enter your password"
          required
          value={form.password}
        />

        <div className="auth-switch mb-3">
          <label className="form-check d-flex align-items-center gap-2">
            <input
              className="form-check-input m-0"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              type="checkbox"
            />
            <span className="form-check-label auth-check">Remember me</span>
          </label>
          <Link className="auth-muted-link small fw-semibold" to="/forgot-password">
            Forgot password?
          </Link>
        </div>

        <button className="btn btn-primary w-100 py-3 rounded-pill" disabled={isSubmitting} type="submit">
          <FaArrowRightToBracket className="me-2" />
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>

        <div className="auth-divider">OR</div>

        <button className="btn auth-google-button py-3 rounded-pill" type="button">
          <span className="auth-google-mark">G</span>
          Continue with Google
        </button>
      </form>
    </AuthLayout>
  );
}

export default Login;
