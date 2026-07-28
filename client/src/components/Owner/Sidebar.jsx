import { NavLink } from "react-router-dom";
import {
  FaArrowRightFromBracket,
  FaBell,
  FaBoxOpen,
  FaCalendarCheck,
  FaCirclePlus,
  FaClockRotateLeft,
  FaComments,
  FaGaugeHigh,
  FaGear,
  FaIndianRupeeSign,
  FaStar,
  FaTruckFast,
  FaUser,
} from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  ["Dashboard", "/owner/dashboard", FaGaugeHigh],
  ["My Equipment", "/owner/equipment", FaBoxOpen],
  ["Add Equipment", "/owner/equipment/new", FaCirclePlus],
  ["Booking Requests", "/owner/booking-requests", FaCalendarCheck],
  ["Current Rentals", "/owner/current-rentals", FaTruckFast],
  ["Rental History", "/owner/rental-history", FaClockRotateLeft],
  ["Earnings", "/owner/earnings", FaIndianRupeeSign],
  ["Payments", "/owner/payments", FaIndianRupeeSign],
  ["Reviews", "/owner/reviews", FaStar],
  ["Chat", "/owner/chat", FaComments],
  ["Notifications", "/owner/notifications", FaBell],
  ["Profile", "/owner/profile", FaUser],
  ["Settings", "/owner/settings", FaGear],
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
              <small>Equipment Rental Portal</small>
            </span>
          </NavLink>
        </div>

        <nav className="owner-nav" aria-label="Owner navigation">
          <p className="owner-nav-label">Owner workspace</p>
          {menuItems.map(([label, path, Icon]) => (
            <NavLink
              key={path}
              to={path}
              onClick={handleNavClick}
              title={collapsed ? label : undefined}
              className={({ isActive }) => `owner-nav-link ${isActive ? "active" : ""}`}
            >
              <Icon aria-hidden="true" />
              <span className="owner-nav-text">{label}</span>
              {label === "Notifications" ? <span className="notification-dot" /> : null}
            </NavLink>
          ))}
        </nav>

        <div className="owner-sidebar-footer">
          <button className="owner-nav-link owner-logout-button w-100 border-0 bg-transparent" onClick={logout} type="button">
            <FaArrowRightFromBracket aria-hidden="true" />
            <span className="owner-nav-text">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
