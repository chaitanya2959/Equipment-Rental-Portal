import { useState } from "react";
import { FaBars, FaBell, FaChevronDown, FaMagnifyingGlass, FaUser } from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";

function OwnerNavbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const initials = (user?.name || "Owner").split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  return <header className="owner-navbar">
    <button aria-label="Open navigation" className="btn btn-light d-lg-none me-2" onClick={onMenuClick} type="button"><FaBars /></button>
    <div className="owner-search d-none d-md-flex"><FaMagnifyingGlass aria-hidden="true" /><input aria-label="Search" placeholder="Search equipment, bookings..." type="search" /></div>
    <div className="ms-auto d-flex align-items-center gap-2 gap-md-3">
      <button aria-label="Notifications" className="owner-icon-button position-relative" type="button"><FaBell /><span className="owner-notification-badge">3</span></button>
      <div className="dropdown">
        <button aria-expanded={profileOpen} className="owner-profile-button" onClick={() => setProfileOpen(!profileOpen)} type="button">
          <span className="owner-avatar">{initials}</span><span className="d-none d-sm-block text-start"><strong>{user?.name || "Owner"}</strong><small>Equipment Owner</small></span><FaChevronDown className="d-none d-sm-inline small" />
        </button>
        {profileOpen && <div className="dropdown-menu dropdown-menu-end show owner-profile-menu"><div className="dropdown-header">Signed in as<br /><strong>{user?.email}</strong></div><button className="dropdown-item" type="button"><FaUser className="me-2" />My profile</button><button className="dropdown-item text-danger" onClick={logout} type="button">Sign out</button></div>}
      </div>
    </div>
  </header>;
}
export default OwnerNavbar;
