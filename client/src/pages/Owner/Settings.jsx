import { useEffect, useMemo, useState } from "react";
import {
  FaBell,
  FaCircleInfo,
  FaDesktop,
  FaGlobe,
  FaLock,
  FaMoon,
  FaPalette,
  FaPhone,
  FaPowerOff,
  FaShieldHalved,
  FaSun,
  FaTrashCan,
  FaWandMagicSparkles,
  FaWifi,
} from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

const SETTINGS_KEY = "renthub_owner_settings";

const defaultSettings = {
  businessName: "",
  language: "en",
  currency: "INR",
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  twoFactorAuthentication: false,
  darkMode: false,
  themeMode: "system",
};

const readStoredSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
};

function Settings() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [settings, setSettings] = useState(readStoredSettings);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const themeLabel = useMemo(
    () =>
      ({
        light: "Light Mode",
        dark: "Dark Mode",
        system: "System Mode",
      }[settings.themeMode] || "System Mode"),
    [settings.themeMode]
  );

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-bs-theme",
      settings.themeMode === "system"
        ? window.matchMedia?.("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : settings.themeMode
    );
  }, [settings.themeMode]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get("/auth/profile");
        if (!active) return;

        const profile = res?.data?.data || {};
        setSettings((prev) => ({
          ...prev,
          businessName: profile.name || user?.name || prev.businessName,
        }));
      } catch (err) {
        if (!active) return;
        console.error(err);
        setError(err.response?.data?.message || "Unable to load settings right now.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user?.name]);

  const persistSettings = (nextSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
  };

  const handleChange = (name, value) => {
    setSettings((prev) => {
      const next = { ...prev, [name]: value };
      persistSettings(next);
      return next;
    });
  };

  const handleToggle = (name) => {
    setSettings((prev) => {
      const next = { ...prev, [name]: !prev[name] };
      persistSettings(next);
      return next;
    });
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await API.put("/auth/profile", {
        name: settings.businessName,
        email: user?.email,
        phone: user?.phone || "",
      });

      persistSettings(settings);
      setSuccess("Settings saved successfully.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const resetValue = {
      ...defaultSettings,
      businessName: user?.name || "",
    };
    setSettings(resetValue);
    persistSettings(resetValue);
    setPasswords({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setError("");
    setSuccess("Settings reset to defaults.");
  };

  const handlePasswordSave = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setPasswordSaving(true);
      setError("");
      setSuccess("");

      await API.put("/auth/change-password", {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });

      setPasswords({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccess("Password changed successfully.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogoutAll = () => {
    logout();
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Delete your account? This workspace does not expose a delete-account API yet, so the current session will be signed out and local preferences removed."
    );

    if (!confirmed) return;

    localStorage.removeItem(SETTINGS_KEY);
    logout();
    setDeleteMessage("Your current session has been signed out. Account deletion requires backend support.");
  };

  return (
    <div className="settings-page">
      <div className="settings-hero card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <div className="card-body p-4 p-lg-5">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-4">
            <div>
              <p className="text-uppercase small fw-semibold text-primary mb-2">Owner workspace</p>
              <h2 className="fw-bold mb-2">Settings</h2>
              <p className="text-secondary mb-0">
                Manage business preferences, notifications, security, privacy, and visual mode from one place.
              </p>
            </div>
            <div className="settings-hero-badge">
              <FaWandMagicSparkles />
              <span>{themeLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <FaCircleInfo />
          <span>{error}</span>
        </div>
      ) : null}

      {success ? <div className="alert alert-success">{success}</div> : null}
      {deleteMessage ? <div className="alert alert-warning">{deleteMessage}</div> : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading settings...</p>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <div className="row g-4">
            <div className="col-12 col-xl-8">
              <div className="settings-card card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                  <div className="section-heading mb-4">
                    <div className="section-icon bg-primary-subtle text-primary">
                      <FaGlobe />
                    </div>
                    <div>
                      <h4 className="fw-bold mb-1">General Settings</h4>
                      <p className="text-muted mb-0">Business identity, language, and currency preferences.</p>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">Business Name</label>
                      <input
                        className="form-control"
                        value={settings.businessName}
                        onChange={(e) => handleChange("businessName", e.target.value)}
                        placeholder="Enter business name"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Language</label>
                      <select
                        className="form-select"
                        value={settings.language}
                        onChange={(e) => handleChange("language", e.target.value)}
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="mr">Marathi</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Currency</label>
                      <select
                        className="form-select"
                        value={settings.currency}
                        onChange={(e) => handleChange("currency", e.target.value)}
                      >
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-card card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                  <div className="section-heading mb-4">
                    <div className="section-icon bg-success-subtle text-success">
                      <FaBell />
                    </div>
                    <div>
                      <h4 className="fw-bold mb-1">Notification Settings</h4>
                      <p className="text-muted mb-0">Choose how you want to receive activity updates.</p>
                    </div>
                  </div>

                  <div className="settings-toggle-list">
                    {[
                      ["emailNotifications", "Email Notifications", "Get booking, review, and account updates by email."],
                      ["smsNotifications", "SMS Notifications", "Receive urgent alerts by text message."],
                      ["pushNotifications", "Push Notifications", "Enable browser or app push alerts."],
                    ].map(([key, label, description]) => (
                      <div className="settings-toggle-item" key={key}>
                        <div>
                          <div className="fw-semibold">{label}</div>
                          <div className="text-muted small">{description}</div>
                        </div>
                        <div className="form-check form-switch m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings[key]}
                            onChange={() => handleToggle(key)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="settings-card card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                  <div className="section-heading mb-4">
                    <div className="section-icon bg-warning-subtle text-warning">
                      <FaLock />
                    </div>
                    <div>
                      <h4 className="fw-bold mb-1">Security Settings</h4>
                      <p className="text-muted mb-0">Keep your owner account secure with password and 2FA controls.</p>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">Change Password</label>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <input
                            className="form-control"
                            type="password"
                            name="oldPassword"
                            value={passwords.oldPassword}
                            onChange={handlePasswordChange}
                            placeholder="Current password"
                          />
                        </div>
                        <div className="col-md-4">
                          <input
                            className="form-control"
                            type="password"
                            name="newPassword"
                            value={passwords.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="New password"
                          />
                        </div>
                        <div className="col-md-4">
                          <input
                            className="form-control"
                            type="password"
                            name="confirmPassword"
                            value={passwords.confirmPassword}
                            onChange={handlePasswordChange}
                            placeholder="Confirm password"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="settings-toggle-item">
                        <div>
                          <div className="fw-semibold">Two Factor Authentication</div>
                          <div className="text-muted small">
                            Add a second verification step for sensitive account actions.
                          </div>
                        </div>
                        <div className="form-check form-switch m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.twoFactorAuthentication}
                            onChange={() => handleToggle("twoFactorAuthentication")}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-12 d-flex justify-content-end">
                      <button className="btn btn-outline-primary" type="button" onClick={handlePasswordSave} disabled={passwordSaving}>
                        {passwordSaving ? "Updating..." : "Change Password"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-4">
              <div className="settings-card card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                  <div className="section-heading mb-4">
                    <div className="section-icon bg-info-subtle text-info">
                      <FaPalette />
                    </div>
                    <div>
                      <h4 className="fw-bold mb-1">Appearance</h4>
                      <p className="text-muted mb-0">Control the theme used across the owner panel.</p>
                    </div>
                  </div>

                  <div className="appearance-grid">
                    {[
                      ["light", FaSun, "Light Mode"],
                      ["dark", FaMoon, "Dark Mode"],
                      ["system", FaDesktop, "System Mode"],
                    ].map(([value, Icon, label]) => (
                      <button
                        key={value}
                        type="button"
                        className={`appearance-option ${settings.themeMode === value ? "active" : ""}`}
                        onClick={() => handleChange("themeMode", value)}
                      >
                        <Icon />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="settings-toggle-item mt-4">
                    <div>
                      <div className="fw-semibold">Dark Mode</div>
                      <div className="text-muted small">Quickly switch the panel to a darker interface.</div>
                    </div>
                    <div className="form-check form-switch m-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.themeMode === "dark"}
                        onChange={() => handleChange("themeMode", settings.themeMode === "dark" ? "light" : "dark")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-card card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                  <div className="section-heading mb-4">
                    <div className="section-icon bg-danger-subtle text-danger">
                      <FaShieldHalved />
                    </div>
                    <div>
                      <h4 className="fw-bold mb-1">Privacy Settings</h4>
                      <p className="text-muted mb-0">Protect your account and active sessions.</p>
                    </div>
                  </div>

                  <div className="privacy-action">
                    <div>
                      <div className="fw-semibold">Logout All Devices</div>
                      <div className="text-muted small">Sign out this session and clear stored credentials.</div>
                    </div>
                    <button className="btn btn-outline-secondary btn-sm" type="button" onClick={handleLogoutAll}>
                      <FaPowerOff className="me-2" />
                      Logout
                    </button>
                  </div>

                  <div className="privacy-action">
                    <div>
                      <div className="fw-semibold text-danger">Delete Account</div>
                      <div className="text-muted small">Current backend does not expose a delete endpoint yet.</div>
                    </div>
                    <button className="btn btn-outline-danger btn-sm" type="button" onClick={handleDeleteAccount}>
                      <FaTrashCan className="me-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              <div className="settings-card card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <div className="section-heading mb-4">
                    <div className="section-icon bg-secondary-subtle text-secondary">
                      <FaWifi />
                    </div>
                    <div>
                      <h4 className="fw-bold mb-1">Current Session</h4>
                      <p className="text-muted mb-0">Active owner account and client session details.</p>
                    </div>
                  </div>
                  <div className="session-card">
                    <div className="small text-muted mb-1">Signed in as</div>
                    <div className="fw-semibold">{user?.name || settings.businessName || "Owner"}</div>
                    <div className="text-muted small">{user?.email || "No email available"}</div>
                    <div className="text-muted small mt-2">
                      <FaPhone className="me-2" />
                      {user?.phone || "Phone not provided"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-footer-actions d-flex flex-column flex-sm-row gap-3 justify-content-end mt-4">
            <button className="btn btn-outline-secondary px-4" type="button" onClick={handleReset}>
              Reset Settings
            </button>
            <button className="btn btn-primary px-4" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Settings;
