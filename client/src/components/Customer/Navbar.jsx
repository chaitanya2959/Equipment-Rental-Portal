import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaBell,
  FaHeart,
  FaMagnifyingGlass,
  FaMessage,
  FaXmark,
  FaBoxOpen,
  FaHouse,
  FaShirt,
  FaBolt,
  FaCameraRetro,
  FaUser,
  FaCalendarDays,
  FaBagShopping,
} from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import SearchBar from "./SearchBar";
import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "./ProfileDropdown";

const CATEGORY_OPTIONS = [
  { label: "All Categories", value: "all", icon: FaBoxOpen },
  { label: "Construction", value: "construction", icon: FaBolt },
  { label: "Tools", value: "tools", icon: FaBoxOpen },
  { label: "Events", value: "events", icon: FaCalendarDays },
  { label: "Photography", value: "photography", icon: FaCameraRetro },
  { label: "Home Care", value: "home-care", icon: FaShirt },
];

function CustomerNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const shellRef = useRef(null);
  const { user, logout, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);
  const initials = (user?.name || "Guest")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!shellRef.current?.contains(event.target)) {
        setCategoryOpen(false);
        setNotificationOpen(false);
        setProfileOpen(false);
        setMobileOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setCategoryOpen(false);
        setNotificationOpen(false);
        setProfileOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setCategoryOpen(false);
    setNotificationOpen(false);
    setProfileOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("customer-menu-open", mobileOpen);
    return () => document.body.classList.remove("customer-menu-open");
  }, [mobileOpen]);

  useEffect(() => {
    let active = true;

    const fetchNotifications = async () => {
      if (!isAuthenticated) {
        setNotifications([]);
        return;
      }

      try {
        const response = await api.get("/notifications");
        if (!active) return;
        setNotifications(response?.data?.data || []);
      } catch {
        if (active) setNotifications([]);
      }
    };

    fetchNotifications();
    return () => {
      active = false;
    };
  }, [isAuthenticated, notificationOpen]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigate(`/customer/equipment?query=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((item) => !item.isRead);
    if (!unread.length) return;

    try {
      await Promise.all(unread.map((item) => api.put(`/notifications/${item._id}/read`)));
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    } catch {
      // keep dropdown usable even if one request fails
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((current) => current.map((item) => (item._id === id ? { ...item, isRead: true } : item)));
    } catch {
      // ignore here; the notifications page shows the actual backend state
    }
  };

  const handleViewAll = () => {
    setNotificationOpen(false);
    navigate("/customer/notifications");
  };

  const activeCategoryLabel =
    CATEGORY_OPTIONS.find((item) => item.value === category)?.label || "All Categories";

  return (
    <header className="customer-navbar-wrap" ref={shellRef}>
      <nav className="navbar customer-navbar">
        <div className="container-fluid px-3 px-xxl-4">
          <div className="customer-navbar-left">
            <button
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="btn customer-icon-button d-lg-none"
              type="button"
              onClick={() => setMobileOpen((current) => !current)}
            >
              {mobileOpen ? <FaXmark /> : <FaBars />}
            </button>

            <Link className="customer-brand" to="/customer/dashboard">
              <span className="customer-brand-mark">R</span>
              <span className="customer-brand-copy">
                <strong>RentHub</strong>
                <small>Premium rental marketplace</small>
              </span>
            </Link>
          </div>

          <div className="customer-navbar-search d-none d-lg-flex">
            <SearchBar
              className="customer-searchbar-compact"
              placeholder="Search equipment, bookings, owners..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onSubmit={handleSearchSubmit}
            />

            <div className="customer-category-select">
              <button
                aria-expanded={categoryOpen}
                className="btn customer-pill-button dropdown-toggle"
                type="button"
                onClick={() => setCategoryOpen((current) => !current)}
              >
                <span>{activeCategoryLabel}</span>
              </button>
              <div className={`dropdown-menu customer-category-menu ${categoryOpen ? "show" : ""}`}>
                {CATEGORY_OPTIONS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      className={`dropdown-item customer-category-item ${category === item.value ? "active" : ""}`}
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setCategory(item.value);
                        setCategoryOpen(false);
                      }}
                    >
                      <span className="customer-category-icon">
                        <Icon />
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="customer-navbar-actions">
            <Link className="btn customer-icon-button d-none d-md-inline-flex" to="/customer/equipment" aria-label="Browse equipment">
              <FaHouse />
            </Link>
            <Link className="btn customer-icon-button d-none d-md-inline-flex" to="/customer/wishlist" aria-label="Wishlist">
              <FaHeart />
            </Link>
            <Link className="btn customer-icon-button d-none d-md-inline-flex" to="/customer/bookings" aria-label="Messages">
              <FaMessage />
            </Link>

            <div className="position-relative">
              <button
                aria-label="Notifications"
                className="btn customer-icon-button"
                type="button"
                onClick={() => {
                  setNotificationOpen((current) => !current);
                  setProfileOpen(false);
                  setCategoryOpen(false);
                }}
              >
                <FaBell />
                {unreadCount > 0 ? <span className="customer-badge">{unreadCount}</span> : null}
              </button>
              <NotificationDropdown
                isOpen={notificationOpen}
                notifications={notifications.slice(0, 5)}
                onMarkAllRead={handleMarkAllRead}
                onMarkRead={handleMarkRead}
                onViewAll={handleViewAll}
              />
            </div>

            {isAuthenticated ? (
              <div className="position-relative">
                <button
                  className="customer-profile-trigger"
                  type="button"
                  onClick={() => {
                    setProfileOpen((current) => !current);
                    setNotificationOpen(false);
                    setCategoryOpen(false);
                  }}
                >
                  <span className="customer-avatar">
                    {user?.profileImage ? <img alt={user?.name || "Customer"} src={user.profileImage} /> : <span>{initials}</span>}
                  </span>
                  <span className="customer-profile-copy d-none d-lg-flex">
                    <strong>{user?.name || "Customer"}</strong>
                    <small>Customer</small>
                  </span>
                </button>
                <ProfileDropdown isOpen={profileOpen} onLogout={handleLogout} user={user} />
              </div>
            ) : (
              <div className="d-none d-md-flex align-items-center gap-2">
                <Link className="btn btn-outline-primary rounded-pill px-3" to="/login">
                  Login
                </Link>
                <Link className="btn btn-primary rounded-pill px-3" to="/register">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className={`customer-mobile-drawer d-lg-none ${mobileOpen ? "show" : ""}`}>
        <div className="customer-mobile-panel">
          <div className="d-flex align-items-center justify-content-between gap-3">
            <div>
              <div className="customer-mobile-title">Search and navigate</div>
              <div className="customer-mobile-subtitle">Fast access to your customer workspace</div>
            </div>
            <button className="btn customer-icon-button" type="button" onClick={() => setMobileOpen(false)}>
              <FaXmark />
            </button>
          </div>

          <div className="mt-3">
            <SearchBar
              className="customer-searchbar-compact"
              placeholder="Search equipment, bookings, owners..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onSubmit={handleSearchSubmit}
            />
          </div>

          <div className="dropdown customer-mobile-category mt-3">
            <button
              aria-expanded={categoryOpen}
              className="btn customer-pill-button dropdown-toggle w-100 justify-content-between"
              type="button"
              onClick={() => setCategoryOpen((current) => !current)}
            >
              <span>{activeCategoryLabel}</span>
            </button>
            <div className={`dropdown-menu customer-category-menu w-100 ${categoryOpen ? "show" : ""}`}>
              {CATEGORY_OPTIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    className={`dropdown-item customer-category-item ${category === item.value ? "active" : ""}`}
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setCategory(item.value);
                      setCategoryOpen(false);
                    }}
                  >
                    <span className="customer-category-icon">
                      <Icon />
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="customer-mobile-links mt-3">
            <Link className={`customer-mobile-link ${location.pathname === "/customer/dashboard" ? "active" : ""}`} to="/customer/dashboard">
              <span className="customer-mobile-link-icon">
                <FaHouse />
              </span>
              <span>Dashboard</span>
            </Link>
            <Link className={`customer-mobile-link ${location.pathname.startsWith("/customer/equipment") ? "active" : ""}`} to="/customer/equipment">
              <span className="customer-mobile-link-icon">
                <FaBagShopping />
              </span>
              <span>Equipment</span>
            </Link>
            <Link className={`customer-mobile-link ${location.pathname.startsWith("/customer/bookings") ? "active" : ""}`} to="/customer/bookings">
              <span className="customer-mobile-link-icon">
                <FaCalendarDays />
              </span>
              <span>Bookings</span>
            </Link>
            <Link className={`customer-mobile-link ${location.pathname.startsWith("/customer/wishlist") ? "active" : ""}`} to="/customer/wishlist">
              <span className="customer-mobile-link-icon">
                <FaHeart />
              </span>
              <span>Wishlist</span>
            </Link>
            <Link className={`customer-mobile-link ${location.pathname.startsWith("/customer/profile") ? "active" : ""}`} to="/customer/profile">
              <span className="customer-mobile-link-icon">
                <FaUser />
              </span>
              <span>Profile</span>
            </Link>
          </div>

          <div className="customer-mobile-actions mt-3">
            {isAuthenticated ? (
              <>
                <button className="btn btn-light rounded-pill w-100 justify-content-start" type="button" onClick={() => navigate("/customer/bookings")}>
                  <FaMessage />
                  <span>Messages</span>
                </button>
                <button className="btn btn-outline-danger rounded-pill w-100 justify-content-start" type="button" onClick={handleLogout}>
                  <FaXmark />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="d-grid gap-2">
                <Link className="btn btn-outline-primary rounded-pill" to="/login">
                  Login
                </Link>
                <Link className="btn btn-primary rounded-pill" to="/register">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default CustomerNavbar;
