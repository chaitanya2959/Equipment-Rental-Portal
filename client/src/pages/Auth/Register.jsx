import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa6";
import PasswordInput from "../../components/common/PasswordInput";
import AuthLayout from "../../layouts/AuthLayout";
import api from "../../services/api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "customer" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setField = (field) => (event) => setForm({ ...form, [field]: event.target.value });
  const submit = async (event) => {
    event.preventDefault(); setError("");
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setIsSubmitting(true);
    try { await api.post("/auth/register", form); navigate("/login", { replace: true, state: { notice: "Account created. Please sign in." } }); }
    catch (requestError) { setError(requestError.response?.data?.message || "Unable to create your account."); }
    finally { setIsSubmitting(false); }
  };
  return <AuthLayout title="Create your account" subtitle="Join RentHub to rent equipment or list your own." footer={<>Already have an account? <Link to="/login">Sign in</Link></>}>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}
    <form onSubmit={submit} noValidate>
      <div className="mb-3"><label className="form-label fw-medium" htmlFor="name">Full name</label><input className="form-control" id="name" onChange={setField("name")} required value={form.name} /></div>
      <div className="mb-3"><label className="form-label fw-medium" htmlFor="email">Email address</label><input autoComplete="email" className="form-control" id="email" onChange={setField("email")} required type="email" value={form.email} /></div>
      <div className="mb-3"><label className="form-label fw-medium" htmlFor="phone">Mobile number</label><input autoComplete="tel" className="form-control" id="phone" onChange={setField("phone")} pattern="[0-9+ -]{10,}" required type="tel" value={form.phone} /></div>
      <div className="mb-3"><label className="form-label fw-medium" htmlFor="role">I want to</label><select className="form-select" id="role" onChange={setField("role")} value={form.role}><option value="customer">Rent equipment</option><option value="owner">List my equipment</option></select></div>
      <PasswordInput autoComplete="new-password" id="password" label="Create password" minLength="6" onChange={setField("password")} required value={form.password} />
      <button className="btn btn-primary w-100 py-2" disabled={isSubmitting} type="submit"><FaUserPlus className="me-2" />{isSubmitting ? "Creating account…" : "Create account"}</button>
    </form>
  </AuthLayout>;
}
export default Register;
