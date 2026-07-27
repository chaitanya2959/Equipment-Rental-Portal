import { FaBell, FaCircleCheck, FaRegClock } from "react-icons/fa6";

function NotificationDropdown({ isOpen, notifications, onMarkAllRead, onMarkRead, onViewAll }) {
  return (
    <div className={`customer-dropdown customer-notification-dropdown ${isOpen ? "show" : ""}`}>
      <div className="customer-dropdown-header">
        <div>
          <div className="customer-dropdown-title">Latest Notifications</div>
          <div className="customer-dropdown-subtitle">{notifications.length} updates</div>
        </div>
        <button className="btn btn-sm btn-outline-primary rounded-pill" type="button" onClick={onMarkAllRead}>
          Mark all read
        </button>
      </div>

      <div className="customer-notification-list">
        {notifications.length ? (
          notifications.map((notification) => (
            <div className={`customer-notification-item ${notification.isRead ? "" : "is-unread"}`} key={notification._id || notification.id}>
              <div className="customer-notification-icon">
                <FaBell />
              </div>
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex align-items-start justify-content-between gap-2">
                  <div className="min-w-0">
                    <div className="customer-notification-title">{notification.title}</div>
                    <div className="customer-notification-message">{notification.message}</div>
                  </div>
                  {!notification.isRead ? (
                    <span className="badge rounded-pill text-bg-primary customer-unread-badge">Unread</span>
                  ) : null}
                </div>
                <div className="customer-notification-time">
                  <FaRegClock />
                  <span>
                    {notification.createdAt
                      ? new Date(notification.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>
                </div>
                <div className="d-flex gap-2 mt-2">
                  <button className="btn btn-sm btn-light rounded-pill" type="button" onClick={onViewAll}>
                    View
                  </button>
                  {!notification.isRead ? (
                    <button
                      className="btn btn-sm btn-light rounded-pill text-primary"
                      type="button"
                      onClick={() => onMarkRead?.(notification._id || notification.id)}
                    >
                      <FaCircleCheck />
                      <span>Mark Read</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="customer-empty-state">
            <div className="customer-empty-icon">
              <FaBell />
            </div>
            <div className="fw-semibold text-dark">No Notifications</div>
            <div className="text-muted small">You are all caught up.</div>
          </div>
        )}
      </div>

      <div className="customer-dropdown-footer">
        <button className="btn btn-primary rounded-pill" type="button" onClick={onViewAll}>
          View All Notifications
        </button>
        <button className="btn btn-outline-secondary rounded-pill" type="button" onClick={onMarkAllRead}>
          <FaCircleCheck />
          <span>Mark as Read</span>
        </button>
      </div>
    </div>
  );
}

export default NotificationDropdown;
