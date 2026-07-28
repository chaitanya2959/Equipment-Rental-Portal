import { useEffect, useMemo, useState } from "react";
import { FaBan, FaCheck, FaClock, FaMagnifyingGlass, FaXmark, FaTrash } from "react-icons/fa6";
import api from "../../services/api";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

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

const statusClass = (status) => {
  const classes = {
    Pending: "bg-warning-subtle text-warning",
    Approved: "bg-success-subtle text-success",
    PickedUp: "bg-info-subtle text-info",
    Completed: "bg-primary-subtle text-primary",
    Cancelled: "bg-secondary-subtle text-secondary",
    Rejected: "bg-danger-subtle text-danger",
  };
  return classes[status] || "bg-light text-dark";
};

const paymentClass = (status) => {
  const classes = {
    Paid: "bg-success-subtle text-success",
    Pending: "bg-warning-subtle text-warning",
    Failed: "bg-danger-subtle text-danger",
    Refunded: "bg-info-subtle text-info",
  };
  return classes[status] || "bg-light text-dark";
};

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/dashboard/admin/bookings");
      setBookings(response?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    let filtered = [...bookings];

    if (normalizedSearch) {
      filtered = filtered.filter((b) => {
        const haystack = [
          b.bookingNumber,
          b.equipment?.name,
          b.customer?.name,
          b.customer?.email,
          b.owner?.name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      });
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    if (paymentFilter !== "All") {
      filtered = filtered.filter((b) => b.paymentStatus === paymentFilter);
    }

    return filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [bookings, search, statusFilter, paymentFilter]);

  const handleStatusUpdate = async (booking, status, paymentStatus) => {
    try {
      setUpdatingId(booking._id);
      const response = await api.put(`/booking/${booking._id}/status`, { status, paymentStatus });
      const updated = response?.data?.data || booking;
      setBookings((prev) => prev.map((item) => (item._id === booking._id ? updated : item)));
      setActionMenu(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Unable to update booking.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <p className="text-uppercase small fw-semibold text-primary mb-2">Admin workspace</p>
          <h2 className="fw-bold mb-1">All Bookings</h2>
          <p className="text-muted mb-0">Manage and monitor every booking across the platform.</p>
        </div>
        <button className="btn btn-primary" onClick={fetchBookings}>
          Refresh
        </button>
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
                  placeholder="Search by booking, equipment, customer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-2">
              <label className="form-label fw-semibold">Status</label>
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="PickedUp">Picked Up</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="col-12 col-md-6 col-lg-2">
              <label className="form-label fw-semibold">Payment</label>
              <select className="form-select" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
            <div className="col-12 col-lg-2 text-lg-end">
              <div className="text-muted small mb-1">Results</div>
              <div className="fw-bold fs-5">{filteredBookings.length}</div>
            </div>
          </div>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <FaClock className="fs-1 text-muted mb-3 mx-auto" />
          <h4 className="fw-semibold mb-2">No bookings found</h4>
          <p className="text-muted mb-0">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="table-responsive card border-0 shadow-sm rounded-4 overflow-hidden">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Booking</th>
                <th>Equipment</th>
                <th>Customer</th>
                <th>Owner</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Dates</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td>
                    <div className="fw-semibold">{booking.bookingNumber || "—"}</div>
                    <div className="text-muted small">{formatDate(booking.createdAt)}</div>
                  </td>
                  <td>{booking.equipment?.name || "—"}</td>
                  <td>
                    <div className="fw-semibold">{booking.customer?.name || "—"}</div>
                    <div className="text-muted small">{booking.customer?.email || "—"}</div>
                  </td>
                  <td>
                    <div className="fw-semibold">{booking.owner?.name || "—"}</div>
                    <div className="text-muted small">{booking.owner?.email || "—"}</div>
                  </td>
                  <td>{formatCurrency(booking.totalAmount)}</td>
                  <td><span className={`badge ${statusClass(booking.status)}`}>{booking.status || "Pending"}</span></td>
                  <td><span className={`badge ${paymentClass(booking.paymentStatus)}`}>{booking.paymentStatus || "Pending"}</span></td>
                  <td>
                    <div className="small">{formatDate(booking.startDate)}</div>
                    <div className="text-muted small">to {formatDate(booking.endDate)}</div>
                  </td>
                  <td>
                    <div className="position-relative">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setActionMenu(actionMenu === booking._id ? null : booking._id)}
                      >
                        Actions
                      </button>
                      {actionMenu === booking._id ? (
                        <div className="dropdown-menu show position-absolute end-0 mt-1" style={{ zIndex: 20, minWidth: "180px" }}>
                          {booking.status !== "Approved" && (
                            <button className="dropdown-item" onClick={() => handleStatusUpdate(booking, "Approved", booking.paymentStatus)}>
                              <FaCheck className="me-2 text-success" /> Approve
                            </button>
                          )}
                          {booking.status !== "Rejected" && (
                            <button className="dropdown-item" onClick={() => handleStatusUpdate(booking, "Rejected", booking.paymentStatus)}>
                              <FaBan className="me-2 text-danger" /> Reject
                            </button>
                          )}
                          {booking.status !== "Completed" && (
                            <button className="dropdown-item" onClick={() => handleStatusUpdate(booking, "Completed", booking.paymentStatus)}>
                              <FaCheck className="me-2 text-primary" /> Mark Complete
                            </button>
                          )}
                          {booking.status !== "Cancelled" && (
                            <button className="dropdown-item" onClick={() => handleStatusUpdate(booking, "Cancelled", booking.paymentStatus)}>
                              <FaXmark className="me-2 text-secondary" /> Cancel
                            </button>
                          )}
                          {booking.paymentStatus === "Pending" && booking.status === "Completed" && (
                            <button className="dropdown-item" onClick={() => handleStatusUpdate(booking, booking.status, "Paid")}>
                              Mark Paid
                            </button>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Bookings;