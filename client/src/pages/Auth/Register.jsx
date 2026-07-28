import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa6";
import PasswordInput from "../../components/common/PasswordInput";
import AuthLayout from "../../layouts/AuthLayout";
import api from "../../services/api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "customer",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      });
      navigate("/login", { replace: true, state: { notice: "Account created. Please sign in." } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create your account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      mode="register"
      title="Create your account"
      subtitle="Join RentHub to rent equipment or list your own inventory."
      footer={
        <>
          Already have an account? <Link to="/login" className="auth-muted-link">Sign in</Link>
        </>
      }
    >
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <form onSubmit={submit} noValidate>
        <div className="mb-3">
          <label className="form-label fw-semibold" htmlFor="name">Full name</label>
          <input
            className="form-control"
            id="name"
            onChange={setField("name")}
            placeholder="Your full name"
            required
            value={form.name}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold" htmlFor="email">Email address</label>
          <input
            autoComplete="email"
            className="form-control"
            id="email"
            onChange={setField("email")}
            placeholder="you@company.com"
            required
            type="email"
            value={form.email}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold" htmlFor="phone">Mobile number</label>
          <input
            autoComplete="tel"
            className="form-control"
            id="phone"
            onChange={setField("phone")}
            pattern="[0-9+ -]{10,}"
            placeholder="Enter mobile number"
            required
            type="tel"
            value={form.phone}
          />
        </div>

        <PasswordInput
          autoComplete="new-password"
          id="password"
          label="Password"
          minLength="6"
          onChange={setField("password")}
          placeholder="Create a password"
          required
          value={form.password}
        />

        <PasswordInput
          autoComplete="new-password"
          id="confirmPassword"
          label="Confirm password"
          onChange={setField("confirmPassword")}
          placeholder="Re-enter your password"
          value={form.confirmPassword}
        />

        <div className="mb-3">
          <label className="form-label fw-semibold" htmlFor="role">I want to</label>
          <select className="form-select" id="role" onChange={setField("role")} value={form.role}>
            <option value="customer">Rent equipment</option>
            <option value="owner">List my equipment</option>
          </select>
        </div>

        <button className="btn btn-primary w-100 py-3 rounded-pill" disabled={isSubmitting} type="submit">
          <FaUserPlus className="me-2" />
          {isSubmitting ? "Creating account…" : "Create account"}
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

export default Register;
