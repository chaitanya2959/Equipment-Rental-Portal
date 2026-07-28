import { useEffect, useState } from "react";
import { FaBell, FaGear, FaLock, FaMoon, FaFloppyDisk, FaShield, FaUser } from "react-icons/fa6";
import api from "../../services/api";

function Settings() {
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", profileImage: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({ email: true, sms: false, bookings: true, reviews: true });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/auth/profile");
      setProfile((prev) => ({ ...prev, ...response?.data?.data }));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put("/auth/profile", profile);
      alert("Profile updated successfully.");
    } catch {
      alert("Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <p className="text-uppercase small fw-semibold text-primary mb-2">Admin workspace</p>
          <h2 className="fw-bold mb-1">Settings</h2>
          <p className="text-muted mb-0">Manage your account preferences and admin settings.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading settings...</p>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-header bg-white border-0">
                <h5 className="mb-0"><FaUser className="me-2" /> Profile Settings</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSave}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Name</label>
                    <input
                      className="form-control"
                      value={profile.name || ""}
                      onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={profile.email || ""}
                      onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Phone</label>
                    <input
                      className="form-control"
                      value={profile.phone || ""}
                      onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <button className="btn btn-primary" type="submit" disabled={saving}>
                    <FaFloppyDisk className="me-1" /> {saving ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-header bg-white border-0">
                <h5 className="mb-0"><FaBell className="me-2" /> Notifications</h5>
              </div>
              <div className="card-body">
                {Object.entries(notifications).map(([key, value]) => (
                  <div className="form-check form-switch mb-3" key={key}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id={`notif-${key}`}
                      checked={value}
                      onChange={(e) => setNotifications((prev) => ({ ...prev, [key]: e.target.checked }))}
                    />
                    <label className="form-check-label" htmlFor={`notif-${key}`}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-header bg-white border-0">
                <h5 className="mb-0"><FaShield className="me-2" /> Admin Preferences</h5>
              </div>
              <div className="card-body">
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="darkMode"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="darkMode">
                    Dark Mode
                  </label>
                </div>
                <div className="alert alert-info">
                  Admin settings are currently read-only. Full configuration will be available in a future update.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;