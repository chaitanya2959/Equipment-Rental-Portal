import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaArrowRightToBracket } from "react-icons/fa6";
import { dashboardPathForRole } from "../../constants/roles";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../layouts/AuthLayout";
import api from "../../services/api";
import PasswordInput from "../../components/common/PasswordInput";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault(); setError(""); setIsSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", form);
      if (!data?.token || !data?.user?.role) throw new Error("Unexpected sign-in response.");
      login({ token: data.token, user: data.user });
      navigate(location.state?.from?.pathname || dashboardPathForRole(data.user.role), { replace: true });
    } catch (requestError) { setError(requestError.response?.data?.message || requestError.message || "Unable to sign in."); }
    finally { setIsSubmitting(false); }
  };

  return <AuthLayout title="Welcome back" subtitle="Sign in to manage your RentHub account." footer={<>New to RentHub? <Link to="/register">Create an account</Link></>}>
    {location.state?.notice && <div className="alert alert-success" role="status">{location.state.notice}</div>}
    {error && <div className="alert alert-danger" role="alert">{error}</div>}
    <form onSubmit={submit} noValidate>
      <div className="mb-3"><label className="form-label fw-medium" htmlFor="email">Email address</label><input autoComplete="email" className="form-control" id="email" onChange={(e) => setForm({ ...form, email: e.target.value })} required type="email" value={form.email} /></div>
      <PasswordInput autoComplete="current-password" id="password" onChange={(e) => setForm({ ...form, password: e.target.value })} required value={form.password} />
      <div className="text-end mb-4"><Link className="small" to="/forgot-password">Forgot password?</Link></div>
      <button className="btn btn-primary w-100 py-2" disabled={isSubmitting} type="submit"><FaArrowRightToBracket className="me-2" />{isSubmitting ? "Signing in…" : "Sign in"}</button>
    </form>
  </AuthLayout>;
}
export default Login;
