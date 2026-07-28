import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaBars, FaBell, FaEnvelope } from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import NotificationDropdown from "../Owner/NotificationDropdown";
import ProfileDropdown from "../Owner/ProfileDropdown";
import SearchBar from "../Owner/SearchBar";

const getMediaUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  const apiRoot = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
  return `${apiRoot}/uploads/${value}`;
};

function Navbar({ onToggleSidebar, isMobile }) {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile] = useState(user || {});
  const intervalRef = useRef(null);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res?.data?.data || []);
    } catch {
      // silent fail
    }
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await API.get("/auth/profile");
        if (!active) return;
        setProfile((prev) => ({ ...prev, ...res?.data?.data }));
      } catch {
        if (!active) return;
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    intervalRef.current = setInterval(fetchNotifications, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications]);

  const initials = (profile?.name || "Admin")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const avatarUrl = getMediaUrl(profile?.profileImage);

  const handleMarkRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((item) => (item._id === id ? { ...item, isRead: true } : item)));
    } catch {
      // silent fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.put("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch {
      // silent fail
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((item) => item._id !== id));
    } catch {
      // silent fail
    }
  };

  return (
    <header className="owner-navbar">
      <div className="owner-navbar-left">
        <button
          aria-label="Toggle sidebar"
          className="owner-navbar-toggle btn btn-light"
          onClick={onToggleSidebar}
          type="button"
        >
          <FaBars />
        </button>

        <SearchBar
          className="owner-navbar-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search equipment, users..."
        />
      </div>

      <div className="owner-navbar-actions">
        {!isMobile ? (
          <button className="owner-icon-button owner-message-button position-relative" type="button" aria-label="Messages">
            <FaEnvelope />
            <span className="owner-badge owner-badge-muted">0</span>
          </button>
        ) : null}

        <button
          className="owner-icon-button position-relative"
          type="button"
          aria-label="Notifications"
          onClick={() => {
            setProfileOpen(false);
            setNotificationOpen((prev) => !prev);
          }}
        >
          <FaBell />
          {unreadCount > 0 ? <span className="owner-badge">{unreadCount}</span> : null}
        </button>

        <button
          className="owner-profile-trigger"
          type="button"
          aria-label="Open profile menu"
          onClick={() => {
            setNotificationOpen(false);
            setProfileOpen((prev) => !prev);
          }}
        >
          <span className="owner-avatar">{avatarUrl ? <img src={avatarUrl} alt={profile?.name || "Admin"} /> : initials}</span>
          <span className="owner-profile-copy d-none d-lg-flex">
            <strong>{profile?.name || "Admin"}</strong>
            <span className="owner-role-badge">Admin</span>
          </span>
        </button>
      </div>

      <NotificationDropdown
        open={notificationOpen}
        notifications={notifications}
        unreadCount={unreadCount}
        onClose={() => setNotificationOpen(false)}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        onDelete={handleDelete}
      />

      <ProfileDropdown
        open={profileOpen}
        user={profile}
        avatarUrl={avatarUrl}
        onClose={() => setProfileOpen(false)}
        onLogout={logout}
      />
    </header>
  );
}

export default Navbar;