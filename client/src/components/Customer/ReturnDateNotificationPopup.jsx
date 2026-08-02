import { useEffect, useState } from "react";
import { FaClock, FaXmark, FaTruckFast } from "react-icons/fa6";
import { getMyBookings } from "../../services/bookingService";

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

function ReturnDateNotificationPopup() {
  const [dueBookings, setDueBookings] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    let active = true;

    const checkReturnTimes = async () => {
      try {
        const bookings = await getMyBookings();
        if (!active || !Array.isArray(bookings)) return;

        const now = new Date();
        const due = bookings.filter((booking) => {
          if (["Completed", "Cancelled", "Rejected"].includes(booking.status)) return false;
          if (!booking.endDate) return false;

          const endDate = new Date(booking.endDate);
          // Set to end of return day if time portion is 00:00:00
          if (endDate.getHours() === 0 && endDate.getMinutes() === 0) {
            endDate.setHours(23, 59, 59, 999);
          }

          // Trigger if return date/time reached or overdue
          return now >= endDate || (booking.status === "PickedUp" && endDate - now <= 86400000);
        });

        setDueBookings(due);
      } catch {
        // Keep UI active even if network check fails
      }
    };

    checkReturnTimes();
    const interval = setInterval(checkReturnTimes, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const activePopups = dueBookings.filter((b) => !dismissed.includes(b._id));

  if (!activePopups.length) return null;

  const currentBooking = activePopups[0];

  return (
    <div className="return-popup-overlay">
      <div className="return-popup-card">
        <div className="return-popup-header">
          <div className="d-flex align-items-center gap-2">
            <span className="return-popup-badge">
              <FaClock /> Equipment Return Alert
            </span>
          </div>
          <button
            type="button"
            className="return-popup-close"
            onClick={() => setDismissed((prev) => [...prev, currentBooking._id])}
            aria-label="Close notification"
          >
            <FaXmark />
          </button>
        </div>

        <div className="return-popup-body">
          <div className="d-flex align-items-center gap-3 mb-2">
            <div className="return-popup-icon">
              <FaTruckFast />
            </div>
            <div>
              <h6 className="fw-bold mb-0 text-dark">
                {currentBooking.equipment?.name || "Rental Equipment"}
              </h6>
              <small className="text-muted">Booking #{currentBooking.bookingNumber || currentBooking._id}</small>
            </div>
          </div>

          <p className="return-popup-message mb-3">
            Your rental period is complete. Please return this equipment to the owner at your earliest convenience.
          </p>

          <div className="return-popup-detail-box">
            <div className="d-flex justify-content-between text-sm">
              <span className="text-muted">Return Date:</span>
              <strong>{formatDate(currentBooking.endDate)}</strong>
            </div>
            <div className="d-flex justify-content-between text-sm mt-1">
              <span className="text-muted">Status:</span>
              <span className="badge bg-warning-subtle text-warning-emphasis">Return Due</span>
            </div>
          </div>
        </div>

        <div className="return-popup-footer">
          <button
            type="button"
            className="btn btn-primary btn-sm rounded-pill w-100"
            onClick={() => setDismissed((prev) => [...prev, currentBooking._id])}
          >
            Acknowledge Reminder
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReturnDateNotificationPopup;
