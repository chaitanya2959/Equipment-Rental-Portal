import { useEffect, useRef } from "react";
import { FaBell, FaBoxOpen, FaCircleInfo, FaCreditCard, FaGear, FaTrashCan, FaCheck, FaCheckDouble } from "react-icons/fa6";
import { Link } from "react-router-dom";

const iconMap = {
  booking: FaBoxOpen,
  equipment: FaGear,
  payment: FaCreditCard,
  system: FaCircleInfo,
};

const formatTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        day: "numeric",
        month: "short",
      })
    : "";

function NotificationDropdown({
  open,
  notifications = [],
  unreadCount = 0,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onDelete,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div ref={ref} className="owner-dropdown owner-notification-dropdown show">
      <div className="owner-dropdown-header">
        <div>
          <p className="mb-1 small text-uppercase text-muted fw-semibold">Latest Notifications</p>
          <h6 className="mb-0 fw-bold">Notifications</h6>
        </div>
        <div className="d-flex align-items-center gap-2">
          {unreadCount > 0 ? (
            <button className="btn btn-sm btn-outline-primary" type="button" onClick={onMarkAllRead} title="Mark all as read">
              <FaCheckDouble className="me-1" /> Mark all read
            </button>
          ) : null}
          <span className="badge bg-primary-subtle text-primary">{unreadCount} unread</span>
        </div>
      </div>

      <div className="owner-notification-list">
        {notifications.length > 0 ? (
          notifications.slice(0, 10).map((item) => {
            const Icon = iconMap[item.type] || FaBell;
            return (
              <div className={`owner-notification-item ${item.isRead ? "" : "is-unread"}`} key={item._id}>
                <div className="owner-notification-icon">
                  <Icon />
                </div>
                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex align-items-start justify-content-between gap-2">
                    <div className="min-w-0">
                      <div className="fw-semibold text-truncate">{item.title}</div>
                      <div className="text-muted small notification-message">{item.message}</div>
                    </div>
                    {!item.isRead ? <span className="badge bg-warning text-dark">New</span> : null}
                  </div>
                  <div className="owner-notification-time">{formatTime(item.createdAt)}</div>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {!item.isRead ? (
                      <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => onMarkRead(item._id)}>
                        <FaCheck className="me-1" />
                        Mark as Read
                      </button>
                    ) : null}
                    <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => onDelete(item._id)}>
                      <FaTrashCan className="me-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="owner-empty-state">
            <FaBell className="owner-empty-icon" />
            <h6 className="fw-bold mb-1">No Notifications</h6>
            <p className="text-muted mb-0 small">You're all caught up for now.</p>
          </div>
        )}
      </div>

      <div className="owner-dropdown-footer">
        <button className="btn btn-light w-100" type="button" onClick={onClose}>
          Close
        </button>
        <Link className="btn btn-primary w-100" to="/owner/notifications" onClick={onClose}>
          View All Notifications
        </Link>
      </div>
    </div>
  );
}

export default NotificationDropdown;