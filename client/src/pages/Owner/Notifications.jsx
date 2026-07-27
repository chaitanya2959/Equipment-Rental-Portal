import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaBell, FaCheck, FaCheckDouble, FaTrash } from "react-icons/fa6";
import API from "../../services/api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const intervalRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setError("");
      const res = await API.get("/notifications");
      setNotifications(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load notifications.");
    }
  }, []);

  useEffect(() => {
    fetchNotifications().finally(() => setLoading(false));
  }, [fetchNotifications]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    intervalRef.current = setInterval(fetchNotifications, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications]);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);

  const handleMarkRead = async (id) => {
    try {
      setProcessingId(id);
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((item) => (item._id === id ? { ...item, isRead: true } : item)));
    } catch (err) {
      console.error(err);
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
      console.error(err);
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
      console.error(err);
      setError(err.response?.data?.message || "Unable to delete notification.");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 mb-4">
        <div>
          <p className="text-uppercase small fw-semibold text-primary mb-2">Owner workspace</p>
          <h2 className="fw-bold mb-1">Notifications</h2>
          <p className="text-muted mb-0">Stay updated with the latest alerts, requests, and system updates.</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {unreadCount > 0 ? (
            <button className="btn btn-outline-primary btn-sm" onClick={handleMarkAllRead} disabled={processingId === "all"}>
              <FaCheckDouble className="me-1" /> {processingId === "all" ? "Processing..." : "Mark All Read"}
            </button>
          ) : null}
          <span className="badge bg-primary-subtle text-primary px-3 py-2">{unreadCount} unread</span>
          <span className="badge bg-secondary-subtle text-secondary px-3 py-2">{notifications.length} total</span>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <div className="d-flex justify-content-center mb-3">
            <div className="rounded-circle bg-light p-3">
              <FaBell className="text-primary fs-3" />
            </div>
          </div>
          <h4 className="fw-semibold mb-2">You're all caught up</h4>
          <p className="text-muted mb-0">New notifications will appear here in real time.</p>
        </div>
      ) : (
        <div className="row g-4">
          {notifications.map((notification) => (
            <div className="col-12" key={notification._id}>
              <div className={`card border-0 shadow-sm rounded-4 h-100 ${notification.isRead ? "bg-white" : "border-primary border-2"}`}>
                <div className="card-body p-4">
                  <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                    <div className="d-flex gap-3">
                      <div className={`rounded-circle d-flex align-items-center justify-content-center ${notification.isRead ? "bg-light text-muted" : "bg-primary text-white"}`} style={{ width: "44px", height: "44px" }}>
                        <FaBell />
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h5 className="fw-semibold mb-0">{notification.title}</h5>
                          {!notification.isRead ? <span className="badge bg-danger-subtle text-danger">New</span> : null}
                        </div>
                        <p className="text-muted mb-2">{notification.message}</p>
                        <div className="small text-muted">{formatDate(notification.createdAt)}</div>
                      </div>
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                      {!notification.isRead ? (
                        <button className="btn btn-outline-primary btn-sm" onClick={() => handleMarkRead(notification._id)} disabled={processingId === notification._id}>
                          <FaCheck className="me-1" /> {processingId === notification._id ? "Processing..." : "Mark Read"}
                        </button>
                      ) : null}
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(notification._id)} disabled={processingId === notification._id}>
                        <FaTrash className="me-1" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;