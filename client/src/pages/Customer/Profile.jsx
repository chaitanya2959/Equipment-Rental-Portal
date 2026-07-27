import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { FaCamera, FaEnvelope, FaLocationDot, FaLock, FaPhone, FaUser } from "react-icons/fa6";

const imageBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

const initialForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  businessName: "",
  upiId: "",
};

const getProfileImage = (profileImage) => {
  if (!profileImage) return "";
  if (/^https?:\/\//i.test(profileImage)) return profileImage;
  return `${imageBaseUrl}/uploads/${profileImage}`;
};

function Profile() {
  const { user: authUser, token, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/auth/profile");
      const data = response?.data?.data || null;
      setProfile(data);
      setForm({
        name: data?.name || "",
        email: data?.email || "",
        phone: data?.phone || "",
        address: data?.address || "",
        city: data?.city || "",
        state: data?.state || "",
        pincode: data?.pincode || "",
        businessName: data?.businessName || "",
        upiId: data?.upiId || "",
      });
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const avatarUrl = useMemo(() => {
    if (selectedFile) return URL.createObjectURL(selectedFile);
    return getProfileImage(profile?.profileImage);
  }, [profile?.profileImage, selectedFile]);

  useEffect(() => {
    return () => {
      if (selectedFile) URL.revokeObjectURL(URL.createObjectURL(selectedFile));
    };
  }, [selectedFile]);

  const initials = (profile?.name || authUser?.name || "Customer")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const summary = [
    { label: "Role", value: profile?.role || authUser?.role || "customer" },
    { label: "Verified", value: profile?.isVerified ? "Yes" : "No" },
    { label: "Active", value: profile?.isActive ? "Yes" : "No" },
    { label: "Joined", value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-IN") : "—" },
  ];

  const handleFormChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handlePasswordChange = (field) => (event) => {
    setPasswordForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (selectedFile) {
        formData.append("profileImage", selectedFile);
      }

      const response = await api.put("/auth/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = response?.data?.data || profile;
      setProfile(updatedUser);
      login({
        token,
        user: {
          ...(authUser || {}),
          ...updatedUser,
        },
      });
      setSelectedFile(null);
      setToast("Profile updated successfully.");
    } catch (saveError) {
      setError(saveError?.response?.data?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    try {
      setChangingPassword(true);
      setError("");
      await api.put("/auth/change-password", {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setToast("Password changed successfully.");
    } catch (passwordError) {
      setError(passwordError?.response?.data?.message || "Unable to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="container-fluid px-0">
      {toast ? <div className="alert alert-success">{toast}</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <p className="text-uppercase small fw-semibold text-primary mb-2">Customer workspace</p>
          <h2 className="fw-bold mb-1">Profile</h2>
          <p className="text-muted mb-0">Manage your account details, contact information, and security settings.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading your profile...</p>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-12 col-xl-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4 p-lg-5 text-center">
                <div className="position-relative d-inline-block mb-4">
                  <div
                    className="rounded-circle overflow-hidden bg-light border"
                    style={{ width: "140px", height: "140px" }}
                  >
                    {avatarUrl ? (
                      <img
                        alt={profile?.name || "Customer"}
                        className="w-100 h-100"
                        src={avatarUrl}
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center fs-1 fw-bold text-primary">
                        {initials}
                      </div>
                    )}
                  </div>
                  <label
                    className="btn btn-primary btn-sm rounded-pill position-absolute bottom-0 end-0"
                    htmlFor="profileImage"
                    style={{ transform: "translate(15%, 15%)" }}
                  >
                    <FaCamera className="me-1" />
                    Photo
                  </label>
                  <input
                    accept="image/*"
                    className="d-none"
                    id="profileImage"
                    type="file"
                    onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                  />
                </div>

                <h4 className="fw-bold mb-1">{profile?.name || "Customer"}</h4>
                <p className="text-muted mb-3">{profile?.email || "—"}</p>

                <div className="row g-3 text-start">
                  {summary.map((item) => (
                    <div className="col-12 col-sm-6" key={item.label}>
                      <div className="border rounded-4 p-3 h-100">
                        <div className="text-muted small">{item.label}</div>
                        <div className="fw-semibold">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border rounded-4 p-3 mt-4 text-start">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <FaUser className="text-primary" />
                    <strong>Quick contact</strong>
                  </div>
                  <div className="text-muted small mb-1">
                    <FaPhone className="me-2" />
                    {profile?.phone || "Phone not provided"}
                  </div>
                  <div className="text-muted small mb-1">
                    <FaLocationDot className="me-2" />
                    {profile?.city || "City"} {profile?.state ? `, ${profile.state}` : ""}
                  </div>
                  <div className="text-muted small">
                    <FaEnvelope className="me-2" />
                    {profile?.email || "Email not provided"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-8">
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                  <div>
                    <h4 className="fw-bold mb-1">Edit Profile</h4>
                    <p className="text-muted mb-0">Update your live account information.</p>
                  </div>
                </div>

                <form onSubmit={handleProfileSave}>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Full Name</label>
                      <input className="form-control" value={form.name} onChange={handleFormChange("name")} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Email</label>
                      <input className="form-control" type="email" value={form.email} onChange={handleFormChange("email")} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Phone</label>
                      <input className="form-control" value={form.phone} onChange={handleFormChange("phone")} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Business Name</label>
                      <input className="form-control" value={form.businessName} onChange={handleFormChange("businessName")} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Address</label>
                      <textarea className="form-control" rows="3" value={form.address} onChange={handleFormChange("address")} />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">City</label>
                      <input className="form-control" value={form.city} onChange={handleFormChange("city")} />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">State</label>
                      <input className="form-control" value={form.state} onChange={handleFormChange("state")} />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Pincode</label>
                      <input className="form-control" value={form.pincode} onChange={handleFormChange("pincode")} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">UPI ID</label>
                      <input className="form-control" value={form.upiId} onChange={handleFormChange("upiId")} />
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-2 mt-4">
                    <button className="btn btn-primary" type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Save Profile"}
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => {
                        setForm({
                          name: profile?.name || "",
                          email: profile?.email || "",
                          phone: profile?.phone || "",
                          address: profile?.address || "",
                          city: profile?.city || "",
                          state: profile?.state || "",
                          pincode: profile?.pincode || "",
                          businessName: profile?.businessName || "",
                          upiId: profile?.upiId || "",
                        });
                        setSelectedFile(null);
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <FaLock className="text-primary" />
                  <h4 className="fw-bold mb-0">Change Password</h4>
                </div>
                <form onSubmit={handlePasswordSave}>
                  <div className="row g-3">
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Current Password</label>
                      <input
                        className="form-control"
                        type="password"
                        value={passwordForm.oldPassword}
                        onChange={handlePasswordChange("oldPassword")}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">New Password</label>
                      <input
                        className="form-control"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange("newPassword")}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Confirm Password</label>
                      <input
                        className="form-control"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange("confirmPassword")}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <button className="btn btn-outline-primary" type="submit" disabled={changingPassword}>
                      {changingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
