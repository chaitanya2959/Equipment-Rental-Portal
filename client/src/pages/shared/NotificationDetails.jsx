import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { FaBell, FaCalendarDays, FaCheck, FaFileLines, FaTicket, FaTruckFast, FaHouse } from "react-icons/fa6";
import BackButton from "../../components/Common/BackButton";
import api from "../../services/api";

const iconMap = {
  booking: FaTicket,
  equipment: FaTruckFast, 
  payment: FaHouse,
  review: FaBell,
  system: FaFileLines,
};

const formatDateTime = (value) => {
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

function NotificationDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchNotification = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/notifications");
        if (!active) return;
        const list = response?.data?.data || [];
        const found = list.find((item) => item._id === id || item.id === id) || null;
        setNotification(found);
        if (!found) {
          setError("Notification not found.");
        }
      } catch (fetchError) {
        if (!active) return;
        setError(fetchError?.response?.data?.message || "Unable to load notification details.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchNotification();
    return () => {
      active = false;
    };
  }, [id]);

  const typeLabel = useMemo(() => {
    if (!notification?.type) return "System";
    return notification.type.charAt(0).toUpperCase() + notification.type.slice(1);
  }, [notification?.type]);

  const handleMarkRead = async () => {
    if (!notification || notification.isRead) return;

    try {
      setMarking(true);
      await api.put(`/notifications/${notification._id}/read`);
      setNotification((current) => (current ? { ...current, isRead: true } : current));
    } catch (markError) {
      setError(markError?.response?.data?.message || "Unable to mark notification as read.");
    } finally {
      setMarking(false);
    }
  };

  const relatedBooking = notification?.bookingId;
  const relatedEquipment = notification?.equipmentId;
  const Icon = iconMap[notification?.type] || FaBell;
  const isOwnerPath = location.pathname.startsWith("/owner");
  const bookingPath = isOwnerPath ? "/owner/booking-requests" : "/customer/bookings";
  const equipmentPath = relatedEquipment?._id
    ? isOwnerPath
      ? `/owner/equipment/${relatedEquipment._id}`
      : `/customer/equipment/${relatedEquipment._id}`
    : "";

  return (
    <div className="container-xxl py-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <BackButton label="Back" />
          <div>
            <p className="text-uppercase small fw-semibold text-primary mb-2 mb-lg-1">Notification details</p>
            <h2 className="fw-bold mb-0">Notification Center</h2>
          </div>
        </div>
        {notification ? (
          <span className={`badge ${notification.isRead ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"} px-3 py-2`}>
            {notification.isRead ? "Read" : "Unread"}
          </span>
        ) : null}
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading notification details...</p>
        </div>
      ) : notification ? (
        <div className="row g-4">
          <div className="col-12 col-xl-7">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex align-items-start gap-3 mb-4">
                  <div className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center" style={{ width: 54, height: 54 }}>
                    <Icon />
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                      <h3 className="fw-bold mb-0">{notification.title}</h3>
                      <span className="badge bg-light text-dark">{typeLabel}</span>
                    </div>
                    <div className="text-muted">{formatDateTime(notification.createdAt)}</div>
                  </div>
                </div>

                <div className="notification-detail-message card border-0 bg-light rounded-4 p-4 mb-4">
                  <div className="text-uppercase small fw-semibold text-muted mb-2">Full message</div>
                  <p className="mb-0 fs-6">{notification.message}</p>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  {!notification.isRead ? (
                    <button className="btn btn-primary rounded-pill" type="button" onClick={handleMarkRead} disabled={marking}>
                      <FaCheck className="me-2" />
                      {marking ? "Marking..." : "Mark as read"}
                    </button>
                  ) : null}
                  {relatedBooking?._id ? (
                    <Link className="btn btn-outline-primary rounded-pill" to={bookingPath}>
                      <FaCalendarDays className="me-2" />
                      Open booking
                    </Link>
                  ) : null}
                  {equipmentPath ? (
                    <Link className="btn btn-outline-secondary rounded-pill" to={equipmentPath}>
                      <FaTruckFast className="me-2" />
                      Open equipment
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-5">
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">Related booking</h5>
                {relatedBooking ? (
                  <div className="border rounded-4 p-3">
                    <div className="fw-semibold">{relatedBooking.bookingNumber || relatedBooking._id}</div>
                    <div className="text-muted small">Status: {relatedBooking.status || "Pending"}</div>
                    <div className="text-muted small">Total: {relatedBooking.totalAmount != null ? relatedBooking.totalAmount : "—"}</div>
                  </div>
                ) : (
                  <div className="text-muted">No booking information attached.</div>
                )}
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">Related equipment</h5>
                {relatedEquipment ? (
                  <div className="border rounded-4 p-3">
                    <div className="fw-semibold">{relatedEquipment.name || "Equipment"}</div>
                    <div className="text-muted small">{relatedEquipment.category || "Category unavailable"}</div>
                    <div className="text-muted small mt-2">
                      {notification.customerId?.name ? `Customer: ${notification.customerId.name}` : null}
                    </div>
                    <div className="text-muted small">
                      {notification.ownerId?.name ? `Owner: ${notification.ownerId.name}` : null}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted">No equipment information attached.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default NotificationDetails;
