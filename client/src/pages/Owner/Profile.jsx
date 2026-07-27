import { useEffect, useState } from "react";
import {
  FaArrowUpFromBracket,
  FaBuilding,
  FaCamera,
  FaCreditCard,
  FaFileArrowUp,
  FaFileLines,
  FaLock,
  FaPaperclip,
  FaUser,
  FaUserShield,
} from "react-icons/fa6";
import API from "../../services/api";
import { getStoredToken, saveSession } from "../../services/authStorage";
import { useAuth } from "../../context/AuthContext";

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

const getMediaUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_ROOT}/uploads/${value}`;
};

const emptyProfile = {
  ownerName: "",
  businessName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  gstNumber: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  upiId: "",
  profileImage: "",
  businessLogo: "",
  documents: [],
};

const emptyPasswords = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(emptyProfile);
  const [baseline, setBaseline] = useState(emptyProfile);
  const [passwords, setPasswords] = useState(emptyPasswords);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [businessLogoFile, setBusinessLogoFile] = useState(null);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [businessLogoPreview, setBusinessLogoPreview] = useState("");
  const [documentPreviews, setDocumentPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await API.get("/auth/profile");
        if (!active) return;

        const data = res?.data?.data || {};
        const nextProfile = {
          ownerName: data.name || "",
          businessName: data.businessName || data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
          gstNumber: data.gstNumber || "",
          bankName: data.bankName || "",
          accountNumber: data.accountNumber || "",
          ifscCode: data.ifscCode || "",
          upiId: data.upiId || "",
          profileImage: data.profileImage || "",
          businessLogo: data.businessLogo || "",
          documents: Array.isArray(data.documents) ? data.documents : [],
        };

        setProfile(nextProfile);
        setBaseline(nextProfile);
        setProfileImagePreview(getMediaUrl(nextProfile.profileImage));
        setBusinessLogoPreview(getMediaUrl(nextProfile.businessLogo));
        setDocumentPreviews(
          nextProfile.documents.map((file) => ({
            name: file,
            url: getMediaUrl(file),
            existing: true,
          }))
        );
      } catch (err) {
        if (!active) return;
        console.error(err);
        setError(err.response?.data?.message || "Unable to load profile data.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Unable to read file"));
      reader.readAsDataURL(file);
    });

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setProfileImageFile(file);
    if (file) {
      readFileAsDataUrl(file).then(setProfileImagePreview).catch(() => setProfileImagePreview(getMediaUrl(profile.profileImage)));
    } else {
      setProfileImagePreview(getMediaUrl(profile.profileImage));
    }
  };

  const handleBusinessLogoChange = (event) => {
    const file = event.target.files?.[0] || null;
    setBusinessLogoFile(file);
    if (file) {
      readFileAsDataUrl(file).then(setBusinessLogoPreview).catch(() => setBusinessLogoPreview(getMediaUrl(profile.businessLogo)));
    } else {
      setBusinessLogoPreview(getMediaUrl(profile.businessLogo));
    }
  };

  const handleDocumentsChange = async (event) => {
    const files = Array.from(event.target.files || []);
    setDocumentFiles(files);

    if (files.length === 0) {
      setDocumentPreviews(
        profile.documents.map((file) => ({
          name: file,
          url: getMediaUrl(file),
          existing: true,
        }))
      );
      return;
    }

    const newPreviews = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        url: await readFileAsDataUrl(file),
        existing: false,
      }))
    );

    setDocumentPreviews([
      ...profile.documents.map((file) => ({
        name: file,
        url: getMediaUrl(file),
        existing: true,
      })),
      ...newPreviews,
    ]);
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("name", profile.ownerName);
      formData.append("businessName", profile.businessName);
      formData.append("email", profile.email);
      formData.append("phone", profile.phone);
      formData.append("address", profile.address);
      formData.append("city", profile.city);
      formData.append("state", profile.state);
      formData.append("pincode", profile.pincode);
      formData.append("gstNumber", profile.gstNumber);
      formData.append("bankName", profile.bankName);
      formData.append("accountNumber", profile.accountNumber);
      formData.append("ifscCode", profile.ifscCode);
      formData.append("upiId", profile.upiId);

      if (profileImageFile) formData.append("profileImage", profileImageFile);
      if (businessLogoFile) formData.append("businessLogo", businessLogoFile);
      documentFiles.forEach((file) => formData.append("documents", file));

      const res = await API.put("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = res?.data?.data || {};
      const updatedProfile = {
        ownerName: updatedUser.name || profile.ownerName,
        businessName: updatedUser.businessName || profile.businessName,
        email: updatedUser.email || profile.email,
        phone: updatedUser.phone || profile.phone,
        address: updatedUser.address || profile.address,
        city: updatedUser.city || profile.city,
        state: updatedUser.state || profile.state,
        pincode: updatedUser.pincode || profile.pincode,
        gstNumber: updatedUser.gstNumber || profile.gstNumber,
        bankName: updatedUser.bankName || profile.bankName,
        accountNumber: updatedUser.accountNumber || profile.accountNumber,
        ifscCode: updatedUser.ifscCode || profile.ifscCode,
        upiId: updatedUser.upiId || profile.upiId,
        profileImage: updatedUser.profileImage || profile.profileImage,
        businessLogo: updatedUser.businessLogo || profile.businessLogo,
        documents: Array.isArray(updatedUser.documents) ? updatedUser.documents : profile.documents,
      };

      setProfile(updatedProfile);
      setBaseline(updatedProfile);
      setProfileImageFile(null);
      setBusinessLogoFile(null);
      setDocumentFiles([]);
      setProfileImagePreview(getMediaUrl(updatedProfile.profileImage));
      setBusinessLogoPreview(getMediaUrl(updatedProfile.businessLogo));
      setDocumentPreviews(
        (Array.isArray(updatedProfile.documents) ? updatedProfile.documents : []).map((file) => ({
          name: file,
          url: getMediaUrl(file),
          existing: true,
        }))
      );

      const token = getStoredToken();
      if (token) {
        saveSession({
          token,
          user: {
            id: updatedUser._id || user?.id,
            name: updatedProfile.ownerName,
            email: updatedProfile.email,
            role: user?.role || "owner",
          },
        });
      }

      setSuccess("Profile saved successfully.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setProfile(baseline);
    setProfileImageFile(null);
    setBusinessLogoFile(null);
    setDocumentFiles([]);
    setProfileImagePreview(getMediaUrl(baseline.profileImage));
    setBusinessLogoPreview(getMediaUrl(baseline.businessLogo));
    setDocumentPreviews(
      (Array.isArray(baseline.documents) ? baseline.documents : []).map((file) => ({
        name: file,
        url: getMediaUrl(file),
        existing: true,
      }))
    );
    setPasswords(emptyPasswords);
    setError("");
    setSuccess("Profile fields reset to the last saved values.");
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

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

      setPasswords(emptyPasswords);
      setSuccess("Password changed successfully.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="owner-profile-page">
      <div className="profile-hero card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <div className="card-body p-4 p-lg-5">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3">
            <div>
              <p className="text-uppercase small fw-semibold text-primary mb-2">Owner workspace</p>
              <h2 className="fw-bold mb-2">Owner Profile</h2>
              <p className="text-secondary mb-0">
                Manage your identity, business branding, payment details, uploaded documents, and account security.
              </p>
            </div>
            <div className="profile-hero-badge">
              <FaUserShield />
              <span>Secure business profile</span>
            </div>
          </div>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading profile...</p>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-12 col-xl-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <div className="text-center">
                  <div className="profile-photo-wrap mx-auto mb-3">
                    {profileImagePreview ? (
                      <img src={profileImagePreview} alt="Profile" className="profile-photo" />
                    ) : (
                      <div className="profile-photo placeholder-photo">
                        <FaUser />
                      </div>
                    )}
                    <label className="profile-upload-badge" htmlFor="profileImage">
                      <FaCamera />
                    </label>
                    <input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={handleProfileImageChange}
                    />
                  </div>

                  <h4 className="fw-bold mb-1">{profile.ownerName || "Owner Name"}</h4>
                  <p className="text-muted mb-3">{profile.businessName || "Business Name"}</p>

                  <div className="logo-card">
                    <div className="small text-muted mb-2">Business Logo</div>
                    <div className="logo-preview">
                      {businessLogoPreview ? (
                        <img src={businessLogoPreview} alt="Business Logo" />
                      ) : (
                        <div className="logo-empty">
                          <FaBuilding />
                        </div>
                      )}
                    </div>
                    <label className="btn btn-outline-primary btn-sm mt-3" htmlFor="businessLogo">
                      <FaArrowUpFromBracket className="me-2" />
                      Upload Logo
                    </label>
                    <input
                      id="businessLogo"
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={handleBusinessLogoChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-8">
            <form onSubmit={handleSaveProfile}>
              <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                  <div className="section-heading mb-4">
                    <div className="section-icon bg-primary-subtle text-primary">
                      <FaUser />
                    </div>
                    <div>
                      <h4 className="fw-bold mb-1">Profile Details</h4>
                      <p className="text-muted mb-0">Update the personal and business identity shown to customers.</p>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Owner Name</label>
                      <input
                        className="form-control"
                        name="ownerName"
                        value={profile.ownerName}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Business Name</label>
                      <input
                        className="form-control"
                        name="businessName"
                        value={profile.businessName}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Email</label>
                      <input
                        className="form-control"
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Phone</label>
                      <input
                        className="form-control"
                        name="phone"
                        value={profile.phone}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Address</label>
                      <textarea
                        className="form-control"
                        name="address"
                        rows="3"
                        value={profile.address}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">City</label>
                      <input className="form-control" name="city" value={profile.city} onChange={handleProfileChange} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">State</label>
                      <input className="form-control" name="state" value={profile.state} onChange={handleProfileChange} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Pincode</label>
                      <input className="form-control" name="pincode" value={profile.pincode} onChange={handleProfileChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">GST Number</label>
                      <input className="form-control" name="gstNumber" value={profile.gstNumber} onChange={handleProfileChange} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                  <div className="section-heading mb-4">
                    <div className="section-icon bg-success-subtle text-success">
                      <FaCreditCard />
                    </div>
                    <div>
                      <h4 className="fw-bold mb-1">Bank Details</h4>
                      <p className="text-muted mb-0">Add payout information for rental settlements and refunds.</p>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Bank Name</label>
                      <input className="form-control" name="bankName" value={profile.bankName} onChange={handleProfileChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Account Number</label>
                      <input
                        className="form-control"
                        name="accountNumber"
                        value={profile.accountNumber}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">IFSC Code</label>
                      <input className="form-control" name="ifscCode" value={profile.ifscCode} onChange={handleProfileChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">UPI ID</label>
                      <input className="form-control" name="upiId" value={profile.upiId} onChange={handleProfileChange} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                  <div className="section-heading mb-4">
                    <div className="section-icon bg-warning-subtle text-warning">
                      <FaPaperclip />
                    </div>
                    <div>
                      <h4 className="fw-bold mb-1">Documents Upload</h4>
                      <p className="text-muted mb-0">Upload business proof, GST certificate, or other compliance documents.</p>
                    </div>
                  </div>

                  <div className="upload-panel">
                    <label className="upload-dropzone" htmlFor="documents">
                      <FaFileArrowUp />
                      <div>
                        <strong>Upload documents</strong>
                        <p className="mb-0 text-muted small">Multiple files supported. PDF, JPG, PNG, DOCX.</p>
                      </div>
                    </label>
                    <input
                      id="documents"
                      type="file"
                      className="d-none"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      multiple
                      onChange={handleDocumentsChange}
                    />
                  </div>

                  <div className="row g-3 mt-1">
                    {documentPreviews.length > 0 ? (
                      documentPreviews.map((doc) => (
                        <div className="col-12 col-md-6" key={`${doc.name}-${doc.url}`}>
                          <div className="document-item">
                            <FaFileLines className="text-primary" />
                            <div className="flex-grow-1">
                              <div className="fw-semibold text-truncate">{doc.name}</div>
                              <a className="small text-decoration-none" href={doc.url} target="_blank" rel="noreferrer">
                                View document
                              </a>
                            </div>
                            {doc.existing ? <span className="badge bg-light text-dark">Saved</span> : <span className="badge bg-warning text-dark">New</span>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-12">
                        <div className="border rounded-4 p-3 text-muted text-center">No documents uploaded yet.</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-end">
                <button className="btn btn-outline-secondary px-4" type="button" onClick={handleReset}>
                  Reset Profile
                </button>
                <button className="btn btn-primary px-4" type="submit" disabled={saving}>
                  Save Profile
                </button>
              </div>
            </form>

            <div className="card border-0 shadow-sm rounded-4 mt-4">
              <div className="card-body p-4">
                <div className="section-heading mb-4">
                  <div className="section-icon bg-danger-subtle text-danger">
                    <FaLock />
                  </div>
                  <div>
                    <h4 className="fw-bold mb-1">Change Password</h4>
                    <p className="text-muted mb-0">Update your account password to keep the owner panel secure.</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit}>
                  <div className="row g-3">
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Current Password</label>
                      <input
                        className="form-control"
                        type="password"
                        name="oldPassword"
                        value={passwords.oldPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">New Password</label>
                      <input
                        className="form-control"
                        type="password"
                        name="newPassword"
                        value={passwords.newPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Confirm Password</label>
                      <input
                        className="form-control"
                        type="password"
                        name="confirmPassword"
                        value={passwords.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    <div className="col-12 d-flex justify-content-end">
                      <button className="btn btn-outline-primary px-4" type="submit" disabled={passwordSaving}>
                        <FaLock className="me-2" />
                        {passwordSaving ? "Updating..." : "Change Password"}
                      </button>
                    </div>
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
