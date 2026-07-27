import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaKey } from "react-icons/fa6";
import PasswordInput from "../../components/common/PasswordInput";
import AuthLayout from "../../layouts/AuthLayout";
import api from "../../services/api";

function ResetPassword() {
  const { token } = useParams(); const navigate = useNavigate(); const [password, setPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState(""); const [error, setError] = useState(""); const [isSubmitting, setIsSubmitting] = useState(false);
  const submit = async (event) => { event.preventDefault(); setError(""); if (password !== confirmPassword) { setError("Passwords do not match."); return; } setIsSubmitting(true); try { await api.post(`/auth/reset-password/${token}`, { password }); navigate("/login", { replace: true, state: { notice: "Password reset successful. Please sign in." } }); } catch (requestError) { setError(requestError.response?.data?.message || "This reset link is invalid or has expired."); } finally { setIsSubmitting(false); } };
  return <AuthLayout title="Choose a new password" subtitle="Use at least 6 characters for a secure password." footer={<Link to="/login">Back to sign in</Link>}>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}<form onSubmit={submit}><PasswordInput autoComplete="new-password" id="password" minLength="6" onChange={(e) => setPassword(e.target.value)} required value={password} /><PasswordInput autoComplete="new-password" id="confirm-password" label="Confirm new password" minLength="6" onChange={(e) => setConfirmPassword(e.target.value)} required value={confirmPassword} /><button className="btn btn-primary w-100 py-2" disabled={isSubmitting || !token} type="submit"><FaKey className="me-2" />{isSubmitting ? "Saving…" : "Reset password"}</button></form>
  </AuthLayout>;
}
export default ResetPassword;
