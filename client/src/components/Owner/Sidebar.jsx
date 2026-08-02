import { NavLink } from "react-router-dom";
import {
  FaArrowRightFromBracket,
  FaBell,
  FaBoxOpen,
  FaCalendarCheck,
  FaChartSimple,
  FaCirclePlus,
  FaClockRotateLeft,
  FaComments,
  FaGear,
  FaGaugeHigh,
  FaIndianRupeeSign,
  FaStar,
  FaTruckFast,
  FaUser,
  FaWallet,
} from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  { label: "Dashboard", path: "/owner/dashboard", icon: FaGaugeHigh },
  { label: "My Equipment", path: "/owner/equipment", icon: FaBoxOpen },
  { label: "Bookings", path: "/owner/booking-requests", icon: FaCalendarCheck },
  { label: "Add Equipment", path: "/owner/equipment/new", icon: FaCirclePlus },
  { label: "Reviews", path: "/owner/reviews", icon: FaStar },
  { label: "Notifications", path: "/owner/notifications", icon: FaBell },
  { label: "Profile", path: "/owner/profile", icon: FaUser },
];

const shortcutItems = [
  { label: "Current Rentals", path: "/owner/current-rentals", icon: FaTruckFast },
  { label: "Rental History", path: "/owner/rental-history", icon: FaClockRotateLeft },
  { label: "Earnings", path: "/owner/earnings", icon: FaIndianRupeeSign },
  { label: "Payments", path: "/owner/payments", icon: FaWallet },
  { label: "Chat", path: "/owner/chat", icon: FaComments },
  { label: "Settings", path: "/owner/settings", icon: FaGear },
];

function Sidebar({ collapsed, isOpen, isMobile, onCloseMobile }) {
  const { logout } = useAuth();

  const handleNavClick = () => {
    if (isMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      <button
        aria-label="Close navigation"
        className={`owner-sidebar-backdrop ${isOpen ? "show" : ""}`}
        onClick={onCloseMobile}
        type="button"
      />
      <aside className={`owner-sidebar ${collapsed ? "is-collapsed" : ""} ${isOpen ? "is-open" : ""}`}>
        <div className="owner-sidebar-brand">
          <NavLink className="owner-brand-link" to="/owner/dashboard" onClick={handleNavClick}>
            <span className="owner-brand-mark">R</span>
            <span className="owner-brand-copy">
              <strong>RentHub</strong>
              <small>Owner</small>
            </span>
          </NavLink>
        </div>

        <div className="owner-sidebar-content">
          <nav className="owner-nav" aria-label="Owner navigation">
            <p className="owner-nav-label">Owner workspace</p>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) => `owner-nav-link ${isActive ? "active" : ""}`}
              >
                <item.icon aria-hidden="true" />
                <span className="owner-nav-text">{item.label}</span>
                {item.label === "Notifications" ? <span className="notification-dot" /> : null}
              </NavLink>
            ))}
          </nav>

          <div className="owner-sidebar-section">
            <p className="owner-sidebar-section-label">Shortcuts</p>
            <nav className="owner-nav" aria-label="Owner shortcuts">
              {shortcutItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) => `owner-shortcut-link ${isActive ? "active" : ""}`}
                >
                  <item.icon aria-hidden="true" />
                  <span className="owner-shortcut-text">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        <div className="owner-sidebar-footer">
          <button
            className="owner-nav-link owner-logout-button w-100 border-0 bg-transparent"
            onClick={logout}
            type="button"
          >
            <FaArrowRightFromBracket aria-hidden="true" />
            <span className="owner-nav-text">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;