import { useEffect, useMemo, useState } from "react";
import { FaBell, FaCheck, FaMagnifyingGlass, FaTrash } from "react-icons/fa6";
import api from "../../services/api";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/notifications");
      setNotifications(response?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    let filtered = [...notifications];

    if (normalizedSearch) {
      filtered = filtered.filter((n) => {
        const haystack = [n.title, n.message, n.type]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      });
    }

    return filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [notifications, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/notifications/${deleteTarget._id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Unable to delete notification.");
    } finally {
      setDeleting(false);
    }
  };

  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.isRead).length;
    const read = total - unread;
    return [
      { title: "Total", value: total, subtitle: "All notifications", color: "primary" },
      { title: "Unread", value: unread, subtitle: "Requires attention", color: "warning" },
      { title: "Read", value: read, subtitle: "Seen", color: "success" },
    ];
  }, [notifications]);

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <p className="text-uppercase small fw-semibold text-primary mb-2">Admin workspace</p>
          <h2 className="fw-bold mb-1">Notifications</h2>
          <p className="text-muted mb-0">Monitor system-wide notifications and alerts.</p>
        </div>
        <button className="btn btn-primary" onClick={fetchNotifications}>
          Refresh
        </button>
      </div>

      <div className="row g-4 mb-4">
        {stats.map((card) => (
          <div className="col-12 col-md-6 col-xl-3" key={card.title}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-1">{card.title}</h6>
                    <h3 className={`text-${card.color} fw-bold mb-0`}>{card.value}</h3>
                  </div>
                  <span className={`badge bg-${card.color}-subtle text-${card.color}`}>{card.subtitle}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-lg-4">
              <label className="form-label fw-semibold">Search</label>
              <div className="position-relative">
                <FaMagnifyingGlass className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  className="form-control ps-5"
                  placeholder="Search by title, message, type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-lg-2 text-lg-end">
              <div className="text-muted small mb-1">Results</div>
              <div className="fw-bold fs-5">{filteredNotifications.length}</div>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <FaBell className="fs-1 text-muted mb-3 mx-auto" />
          <h4 className="fw-semibold mb-2">No notifications found</h4>
          <p className="text-muted mb-0">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="table-responsive card border-0 shadow-sm rounded-4 overflow-hidden">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Title</th>
                <th>Message</th>
                <th>Type</th>
                <th>Status</th>
                <th>Received</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotifications.map((notification) => (
                <tr key={notification._id}>
                  <td>
                    <div className="fw-semibold small">{notification.title || "—"}</div>
                  </td>
                  <td>
                    <div className="small" style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {notification.message || "—"}
                    </div>
                  </td>
                  <td><span className="badge bg-light text-dark">{notification.type || "—"}</span></td>
                  <td>
                    <span className={`badge ${notification.isRead ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"}`}>
                      {notification.isRead ? "Read" : "Unread"}
                    </span>
                  </td>
                  <td>{formatDate(notification.createdAt)}</td>
                  <td>
                    <div className="d-flex justify-content-end">
                      <button
                        className="btn btn-outline-danger btn-sm"
                        type="button"
                        onClick={() => setDeleteTarget(notification)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content rounded-4 border-0">
              <div className="modal-header">
                <h5 className="modal-title">Delete Notification</h5>
                <button type="button" className="btn-close" onClick={() => setDeleteTarget(null)} />
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete this notification? This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" type="button" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger" type="button" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;