import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaGear, FaLock, FaRightFromBracket, FaUser, FaUserPen } from "react-icons/fa6";

function ProfileDropdown({ open, user, onClose, onLogout, avatarUrl = "" }) {
  const ref = useRef(null);
  const initials = (user?.name || "Owner")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div ref={ref} className="owner-dropdown owner-profile-dropdown show">
      <div className="owner-profile-summary">
        <div className="owner-profile-avatar">
          {avatarUrl ? <img src={avatarUrl} alt={user?.name || "Owner"} /> : <span>{initials}</span>}
        </div>
        <div className="min-w-0">
          <div className="fw-bold text-truncate">{user?.name || "Owner"}</div>
          <div className="text-muted small text-truncate">{user?.email || "owner@example.com"}</div>
          <span className="badge bg-success-subtle text-success mt-2">Owner</span>
        </div>
      </div>

      <div className="owner-dropdown-menu">
        <Link className="owner-dropdown-link" to="/owner/profile" onClick={onClose}>
          <FaUser />
          <span>Profile</span>
        </Link>
        <Link className="owner-dropdown-link" to="/owner/profile" onClick={onClose}>
          <FaUserPen />
          <span>My Account</span>
        </Link>
        <Link className="owner-dropdown-link" to="/owner/settings" onClick={onClose}>
          <FaGear />
          <span>Settings</span>
        </Link>
        <Link className="owner-dropdown-link" to="/owner/profile#password" onClick={onClose}>
          <FaLock />
          <span>Change Password</span>
        </Link>
      </div>

      <button className="owner-dropdown-link owner-logout-link" type="button" onClick={onLogout}>
        <FaRightFromBracket />
        <span>Logout</span>
      </button>
    </div>
  );
}

export default ProfileDropdown;
