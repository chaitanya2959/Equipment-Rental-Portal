import { useEffect, useState } from "react";
import { FaBoxOpen, FaCalendarDays, FaCheck, FaEye, FaXmark, FaTruck, FaFlag, FaUser } from "react-icons/fa6";
import API from "../../services/api";

const statusClasses = {
  Pending: "bg-warning-subtle text-warning",
  Approved: "bg-success-subtle text-success",
  Rejected: "bg-danger-subtle text-danger",
  PickedUp: "bg-info-subtle text-info",
  Completed: "bg-primary-subtle text-primary",
  Cancelled: "bg-secondary-subtle text-secondary",
};

const statusFlow = {
  Pending: ["Approved", "Rejected"],
  Approved: ["PickedUp", "Rejected"],
  PickedUp: ["Completed"],
  Completed: [],
  Rejected: [],
  Cancelled: [],
};

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/booking/owner");
      setBookings(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load booking requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      setUpdatingId(bookingId);
      await API.put(`/booking/${bookingId}/status`, { status });
      setBookings((prev) => prev.map((item) => (item._id === bookingId ? { ...item, status } : item)));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to update booking status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderActionButtons = (booking) => {
    const nextStatuses = statusFlow[booking.status] || [];
    if (nextStatuses.length === 0) return null;

    const buttons = [];
    if (nextStatuses.includes("Approved")) {
      buttons.push(
        <button className="btn btn-success btn-sm flex-fill" key="approve" disabled={updatingId === booking._id} onClick={() => handleStatusUpdate(booking._id, "Approved")}>
          <FaCheck className="me-1" /> {updatingId === booking._id ? "Updating..." : "Approve"}
        </button>
      );
    }
    if (nextStatuses.includes("Rejected")) {
      buttons.push(
        <button className="btn btn-danger btn-sm flex-fill" key="reject" disabled={updatingId === booking._id} onClick={() => handleStatusUpdate(booking._id, "Rejected")}>
          <FaXmark className="me-1" /> {updatingId === booking._id ? "Updating..." : "Reject"}
        </button>
      );
    }
    if (nextStatuses.includes("PickedUp")) {
      buttons.push(
        <button className="btn btn-info btn-sm flex-fill text-white" key="pickup" disabled={updatingId === booking._id} onClick={() => handleStatusUpdate(booking._id, "PickedUp")}>
          <FaTruck className="me-1" /> {updatingId === booking._id ? "Updating..." : "Picked Up"}
        </button>
      );
    }
    if (nextStatuses.includes("Completed")) {
      buttons.push(
        <button className="btn btn-primary btn-sm flex-fill" key="complete" disabled={updatingId === booking._id} onClick={() => handleStatusUpdate(booking._id, "Completed")}>
          <FaFlag className="me-1" /> {updatingId === booking._id ? "Updating..." : "Completed"}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div>
      <div className="owner-page-header d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-2 mb-4">
        <div>
          <p className="owner-page-eyebrow mb-1">Owner Workspace</p>
          <h1 className="owner-page-title mb-1">Bookings</h1>
          <p className="owner-page-subtitle mb-0">Review customer requests, approve or reject them, and keep your rentals organized.</p>
        </div>
        <div className="badge bg-primary-subtle text-primary px-3 py-2">{bookings.length} requests</div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading booking requests...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <h4 className="fw-semibold mb-2">No booking requests yet</h4>
          <p className="text-muted mb-0">New customer requests will appear here as soon as they are made.</p>
        </div>
      ) : (
        <div className="row g-4">
          {bookings.map((booking) => (
            <div className="col-12 col-lg-6" key={booking._id}>
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                    <div>
                      <p className="text-uppercase small fw-semibold text-primary mb-1">Booking request</p>
                      <h5 className="fw-bold mb-1">{booking.equipment?.name || "Equipment"}</h5>
                      <div className="text-muted small">{booking.equipment?.category || "Uncategorized"}</div>
                    </div>
                    <span className={`badge ${statusClasses[booking.status] || "bg-light text-dark"}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="border rounded-4 p-3 bg-light mb-3">
                    <div className="d-flex align-items-center gap-2 text-muted mb-3">
                      <FaUser />
                      <span className="fw-semibold text-dark">Customer details</span>
                    </div>
                    <div className="fw-semibold">{booking.customer?.name || "Unknown customer"}</div>
                    <div className="small text-muted">{booking.customer?.email || "No email provided"}</div>
                    <div className="small text-muted">{booking.customer?.phone || "No phone provided"}</div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <div className="border rounded-3 p-3 h-100">
                        <div className="small text-muted mb-1">Booking date</div>
                        <div className="fw-semibold">{formatDate(booking.createdAt)}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="border rounded-3 p-3 h-100">
                        <div className="small text-muted mb-1">Rental period</div>
                        <div className="fw-semibold">{formatDate(booking.startDate)} to {formatDate(booking.endDate)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-4 p-3 mb-3">
                    <div className="d-flex align-items-center gap-2 text-muted mb-2">
                      <FaBoxOpen />
                      <span className="fw-semibold text-dark">Equipment info</span>
                    </div>
                    <div className="d-flex justify-content-between small mb-1">
                      <span>Equipment</span>
                      <strong>{booking.equipment?.name || "—"}</strong>
                    </div>
                    <div className="d-flex justify-content-between small mb-1">
                      <span>Brand</span>
                      <strong>{booking.equipment?.brand || "—"}</strong>
                    </div>
                    <div className="d-flex justify-content-between small mb-1">
                      <span>Days</span>
                      <strong>{booking.totalDays || 0}</strong>
                    </div>
                    <div className="d-flex justify-content-between small mb-1">
                      <span>Amount</span>
                      <strong>₹{booking.totalAmount || 0}</strong>
                    </div>
                    <div className="d-flex justify-content-between small mb-1">
                      <span>Payment</span>
                      <strong>{booking.paymentStatus || "Pending"}</strong>
                    </div>
                    <div className="d-flex justify-content-between small">
                      <span>Deposit</span>
                      <strong>₹{booking.depositAmount || 0}</strong>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-2 mb-2">
                    <button className="btn btn-outline-primary btn-sm flex-fill" onClick={() => setSelectedBooking(booking)}>
                      <FaEye className="me-1" /> View Details
                    </button>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    {renderActionButtons(booking)}
                    {statusFlow[booking.status]?.length === 0 ? (
                      <button className="btn btn-outline-secondary btn-sm flex-fill" disabled>
                        <FaCalendarDays className="me-1" /> {booking.status}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBooking ? (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content rounded-4 border-0">
              <div className="modal-header">
                <h5 className="modal-title">Booking Details</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedBooking(null)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <div className="text-muted small">Equipment</div>
                  <div className="fw-semibold">{selectedBooking.equipment?.name || "—"}</div>
                </div>
                <div className="mb-3">
                  <div className="text-muted small">Customer</div>
                  <div className="fw-semibold">{selectedBooking.customer?.name || "—"}</div>
                  <div className="small text-muted">{selectedBooking.customer?.email || "—"}</div>
                  <div className="small text-muted">{selectedBooking.customer?.phone || "—"}</div>
                </div>
                <div className="mb-3">
                  <div className="text-muted small">Booking date</div>
                  <div className="fw-semibold">{formatDate(selectedBooking.createdAt)}</div>
                </div>
                <div className="mb-3">
                  <div className="text-muted small">Rental period</div>
                  <div className="fw-semibold">{formatDate(selectedBooking.startDate)} to {formatDate(selectedBooking.endDate)}</div>
                </div>
                <div className="mb-3">
                  <div className="text-muted small">Days</div>
                  <div className="fw-semibold">{selectedBooking.totalDays || 0}</div>
                </div>
                <div className="mb-3">
                  <div className="text-muted small">Amount</div>
                  <div className="fw-semibold">₹{selectedBooking.totalAmount || 0}</div>
                </div>
                <div className="mb-3">
                  <div className="text-muted small">Payment</div>
                  <div className="fw-semibold">{selectedBooking.paymentStatus || "—"}</div>
                </div>
                <div className="mb-3">
                  <div className="text-muted small">Payment Method</div>
                  <div className="fw-semibold">{selectedBooking.paymentMethod || "—"}</div>
                </div>
                <div>
                  <div className="text-muted small">Status</div>
                  <div className="fw-semibold">{selectedBooking.status}</div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setSelectedBooking(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Bookings;