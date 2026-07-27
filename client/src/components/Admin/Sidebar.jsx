import { NavLink } from "react-router-dom";
import {
  FaArrowRightFromBracket,
  FaBell,
  FaBook,
  FaBoxOpen,
  FaChartPie,
  FaChevronLeft,
  FaChevronRight,
  FaGaugeHigh,
  FaGear,
  FaIndianRupeeSign,
  FaList,
  FaStar,
  FaTags,
  FaUsers,
} from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  ["Dashboard", "/admin/dashboard", FaGaugeHigh],
  ["Users", "/admin/users", FaUsers],
  ["Owners", "/admin/owners", FaUsers],
  ["Customers", "/admin/customers", FaUsers],
  ["Equipment", "/admin/equipments", FaBoxOpen],
  ["Categories", "/admin/categories", FaTags],
  ["Bookings", "/admin/bookings", FaBook],
  ["Payments", "/admin/payments", FaIndianRupeeSign],
  ["Reviews", "/admin/reviews", FaStar],
  ["Notifications", "/admin/notifications", FaBell],
  ["Reports", "/admin/reports", FaChartPie],
  ["Settings", "/admin/settings", FaGear],
];

function Sidebar({ collapsed, isOpen, isMobile, onToggleCollapse, onCloseMobile }) {
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
          <NavLink className="owner-brand-link" to="/admin/dashboard" onClick={handleNavClick}>
            <span className="owner-brand-mark">R</span>
            <span className="owner-brand-copy">
              <strong>RentHub</strong>
              <small>Equipment Rental Portal</small>
            </span>
          </NavLink>

          <button
            className="owner-sidebar-toggle btn btn-sm btn-light"
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>

        <nav className="owner-nav" aria-label="Admin navigation">
          <p className="owner-nav-label">Admin workspace</p>
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