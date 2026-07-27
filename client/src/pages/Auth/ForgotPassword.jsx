import { useState } from "react";
import { Link } from "react-router-dom";
import { FaPaperPlane } from "react-icons/fa6";
import AuthLayout from "../../layouts/AuthLayout";
import api from "../../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState(""); const [error, setError] = useState(""); const [sent, setSent] = useState(false); const [isSubmitting, setIsSubmitting] = useState(false);
  const submit = async (event) => { event.preventDefault(); setError(""); setIsSubmitting(true); try { await api.post("/auth/forgot-password", { email }); setSent(true); } catch (requestError) { setError(requestError.response?.data?.message || "We could not send a reset link."); } finally { setIsSubmitting(false); } };
  return <AuthLayout title="Reset your password" subtitle="Enter your email and we’ll send a secure reset link." footer={<Link to="/login">Back to sign in</Link>}>
    {sent ? <div className="alert alert-success mb-0" role="status">If an account exists for this email, a password reset link has been sent.</div> : <form onSubmit={submit}><div className="mb-4"><label className="form-label fw-medium" htmlFor="email">Email address</label><input autoComplete="email" className="form-control" id="email" onChange={(e) => setEmail(e.target.value)} required type="email" value={email} /></div>{error && <div className="alert alert-danger" role="alert">{error}</div>}<button className="btn btn-primary w-100 py-2" disabled={isSubmitting} type="submit"><FaPaperPlane className="me-2" />{isSubmitting ? "Sending…" : "Send reset link"}</button></form>}
  </AuthLayout>;
}
export default ForgotPassword;
