import { Link, useLocation } from "react-router-dom";
import {
  FaBagShopping,
  FaChartSimple,
  FaHeart,
  FaHouse,
  FaListCheck,
  FaUser,
  FaBell,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa6";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/customer/dashboard", icon: FaHouse },
  { label: "Equipment", to: "/customer/equipment", icon: FaBagShopping },
  { label: "Bookings", to: "/customer/bookings", icon: FaListCheck },
  { label: "Wishlist", to: "/customer/wishlist", icon: FaHeart },
  { label: "Notifications", to: "/customer/notifications", icon: FaBell },
  { label: "Profile", to: "/customer/profile", icon: FaUser },
];

function CustomerSidebar({ collapsed = false, onToggleCollapsed }) {
  const location = useLocation();

  return (
    <aside className={`customer-sidebar ${collapsed ? "is-collapsed" : ""}`}>
      <div className="customer-sidebar-top">
        <Link className="customer-sidebar-brand" to="/customer/dashboard">
          <span className="customer-sidebar-mark">R</span>
          <span className="customer-sidebar-copy">
            <strong>RentHub</strong>
            <small>Customer workspace</small>
          </span>
        </Link>
        <button
          className="btn customer-sidebar-toggle d-none d-lg-inline-flex"
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      <div className="customer-sidebar-section">
        <div className="customer-sidebar-section-label">Navigation</div>
        <nav className="customer-sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
            return (
              <Link
                className={`customer-sidebar-link ${active ? "active" : ""}`}
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
              >
                <span className="customer-sidebar-icon">
                  <Icon />
                </span>
                <span className="customer-sidebar-label">{item.label}</span>
                {active ? <span className="customer-sidebar-indicator" /> : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="customer-sidebar-section customer-sidebar-panel">
        <div className="customer-sidebar-section-label">Shortcuts</div>
        <div className="customer-sidebar-shortcuts">
          <Link className="customer-sidebar-shortcut" to="/customer/bookings">
            <FaChartSimple />
            <span>Rental stats</span>
          </Link>
          <Link className="customer-sidebar-shortcut" to="/customer/notifications">
            <FaBell />
            <span>Messages</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default CustomerSidebar;
