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
  FaCircleQuestion,
  FaStar,
  FaMagnifyingGlass,
  FaCrown,
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
            <small>Customer</small>
          </span>
        </Link>
      </div>

      <div className="customer-sidebar-content-wrapper">
        <div className="customer-sidebar-section">
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

        <div className="customer-sidebar-section">
          <div className="customer-sidebar-section-label">SHORTCUTS</div>
          <nav className="customer-sidebar-nav">
            <Link
              className={`customer-sidebar-link ${location.pathname.includes("/reviews") ? "active" : ""}`}
              to="/customer/reviews"
              title={collapsed ? "My Reviews" : undefined}
            >
              <span className="customer-sidebar-icon"><FaStar /></span>
              <span className="customer-sidebar-label">My Reviews</span>
            </Link>
            <Link
              className={`customer-sidebar-link ${location.pathname.includes("/search") ? "active" : ""}`}
              to="/customer/equipment"
              title={collapsed ? "Saved Searches" : undefined}
            >
              <span className="customer-sidebar-icon"><FaMagnifyingGlass /></span>
              <span className="customer-sidebar-label">Saved Searches</span>
            </Link>
            <Link
              className={`customer-sidebar-link ${location.pathname.includes("/rental-stats") ? "active" : ""}`}
              to="/customer/rental-stats"
              title={collapsed ? "Rental Stats" : undefined}
            >
              <span className="customer-sidebar-icon"><FaChartSimple /></span>
              <span className="customer-sidebar-label">Rental Stats</span>
            </Link>
            <Link
              className={`customer-sidebar-link ${location.pathname.includes("/help") ? "active" : ""}`}
              to="/customer/help"
              title={collapsed ? "Help & Support" : undefined}
            >
              <span className="customer-sidebar-icon"><FaCircleQuestion /></span>
              <span className="customer-sidebar-label">Help & Support</span>
            </Link>
          </nav>
        </div>

        {!collapsed && (
          <div className="customer-sidebar-upgrade-card p-3 mx-2 my-3 text-white text-center">
            <div className="upgrade-card-icon mb-2">
              <FaCrown />
            </div>
            <h5>Upgrade Your Experience</h5>
            <p className="small mb-3 text-white-50">Get premium features and exclusive offers</p>
            <button className="btn btn-light btn-sm w-100 rounded-pill font-weight-bold" type="button">
              Upgrade Now
            </button>
          </div>
        )}
      </div>

      <div className="customer-sidebar-footer-toggle">
        <button
          className="customer-sidebar-collapse-btn"
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>
    </aside>
  );
}

export default CustomerSidebar;
