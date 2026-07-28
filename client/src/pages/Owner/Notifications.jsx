import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaFilter,
  FaMagnifyingGlass,
  FaMoneyBillWave,
  FaStar,
  FaTrash,
  FaTruckFast,
} from "react-icons/fa6";
import API from "../../services/api";
import BackButton from "../../components/Common/BackButton";

const iconMap = {
  booking: FaTruckFast,
  equipment: FaTruckFast,
  payment: FaMoneyBillWave,
  review: FaStar,
  system: FaBell,
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const intervalRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setError("");
      const res = await API.get("/notifications");
      setNotifications(res?.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load notifications.");
    }
  }, []);

  useEffect(() => {
    fetchNotifications().finally(() => setLoading(false));
  }, [fetchNotifications]);

  useEffect(() => {
    intervalRef.current = setInterval(fetchNotifications, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications]);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...notifications].filter((item) => {
      const haystack = [
        item.title,
        item.message,
        item.type,
        item.bookingId?.bookingNumber,
        item.equipmentId?.name,
        item.customerId?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (filter === "read" && !item.isRead) return false;
      if (filter === "unread" && item.isRead) return false;
      if (filter !== "all" && filter !== "read" && filter !== "unread" && item.type !== filter) return false;
      return !query || haystack.includes(query);
    });
  }, [filter, notifications, search]);

  const handleMarkRead = async (id) => {
    try {
      setProcessingId(id);
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((item) => (item._id === id ? { ...item, isRead: true } : item)));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to mark notification as read.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setProcessingId("all");
      await API.put("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to mark all as read.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      setProcessingId(id);
      await API.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete notification.");
    } finally {
      setProcessingId(null);
    }
  };

  const summaryCards = [
    { title: "Total", value: notifications.length, tone: "primary" },
    { title: "Unread", value: unreadCount, tone: "warning" },
    { title: "Read", value: notifications.length - unreadCount, tone: "success" },
  ];

  return (
    <div className="container-xxl py-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <BackButton label="Back" />
          <div>
            <p className="text-uppercase small fw-semibold text-primary mb-2 mb-lg-1">Owner workspace</p>
            <h2 className="fw-bold mb-0">Notifications</h2>
            <p className="text-muted mb-0">Track booking requests, payments, equipment events, and review activity.</p>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          {unreadCount > 0 ? (
            <button className="btn btn-outline-primary btn-sm" onClick={handleMarkAllRead} disabled={processingId === "all"}>
              <FaCheckDouble className="me-1" /> {processingId === "all" ? "Processing..." : "Mark all read"}
            </button>
          ) : null}
          <span className="badge bg-primary-subtle text-primary px-3 py-2">{unreadCount} unread</span>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {summaryCards.map((card) => (
          <div className="col-12 col-md-4" key={card.title}>
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4 d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-muted small">{card.title}</div>
                  <div className={`fw-bold fs-3 text-${card.tone}`}>{card.value}</div>
                </div>
                <span className={`badge bg-${card.tone}-subtle text-${card.tone}`}>Live</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-lg-6">
              <label className="form-label fw-semibold">Search</label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaMagnifyingGlass />
                </span>
                <input
                  className="form-control"
                  placeholder="Search title, message, customer, equipment..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-semibold">Filter</label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaFilter />
                </span>
                <select className="form-select" value={filter} onChange={(event) => setFilter(event.target.value)}>
                  <option value="all">All notifications</option>
                  <option value="unread">Unread only</option>
                  <option value="read">Read only</option>
                  <option value="booking">Booking request</option>
                  <option value="equipment">Equipment</option>
                  <option value="payment">Payment</option>
                  <option value="review">Review</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-3 d-grid">
              <button className="btn btn-outline-secondary" type="button" onClick={fetchNotifications}>
                Refresh notifications
              </button>
            </div>
          </div>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <FaBell className="fs-1 text-muted mx-auto mb-3" />
          <h4 className="fw-semibold mb-2">No notifications found</h4>
          <p className="text-muted mb-0">Try a different filter or search term.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredNotifications.map((notification) => {
            const Icon = iconMap[notification.type] || FaBell;
            return (
              <div className="col-12" key={notification._id}>
                <div className={`card border-0 shadow-sm rounded-4 h-100 ${notification.isRead ? "bg-white" : "border-primary border-2"}`}>
                  <div className="card-body p-4">
                    <div className="d-flex flex-column flex-xl-row justify-content-between gap-3">
                      <div className="d-flex gap-3">
                        <div className={`rounded-circle d-flex align-items-center justify-content-center ${notification.isRead ? "bg-light text-muted" : "bg-primary text-white"}`} style={{ width: 52, height: 52 }}>
                          <Icon />
                        </div>
                        <div className="min-w-0">
                          <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                            <h5 className="fw-semibold mb-0">{notification.title || "Notification"}</h5>
                            {!notification.isRead ? <span className="badge bg-warning-subtle text-warning">Unread</span> : null}
                          </div>
                          <p className="text-muted mb-2">{notification.message || "No details available."}</p>
                          <div className="text-muted small mb-1">{formatDate(notification.createdAt)}</div>
                          <div className="d-flex flex-wrap gap-2">
                            {notification.bookingId ? <span className="badge bg-light text-dark">Booking: {notification.bookingId.bookingNumber || notification.bookingId._id}</span> : null}
                            {notification.equipmentId ? <span className="badge bg-light text-dark">Equipment: {notification.equipmentId.name || "Equipment"}</span> : null}
                            {notification.customerId ? <span className="badge bg-light text-dark">Customer: {notification.customerId.name || "Customer"}</span> : null}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex flex-wrap gap-2 align-items-start">
                        <Link className="btn btn-outline-primary btn-sm" to={`/owner/notifications/${notification._id}`}>
                          Open details
                        </Link>
                        {!notification.isRead ? (
                          <button className="btn btn-primary btn-sm" onClick={() => handleMarkRead(notification._id)} disabled={processingId === notification._id}>
                            <FaCheck className="me-1" />
                            {processingId === notification._id ? "Processing..." : "Mark read"}
                          </button>
                        ) : null}
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(notification._id)} disabled={processingId === notification._id}>
                          <FaTrash className="me-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;
