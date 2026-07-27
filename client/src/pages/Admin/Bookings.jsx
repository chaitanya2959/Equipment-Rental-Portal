import { useEffect, useMemo, useState } from "react";
import { FaDollarSign, FaFilter, FaMagnifyingGlass, FaSearch, FaSyncAlt, FaTruck } from "react-icons/fa6";
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

const statusClasses = {
  Pending: "bg-warning-subtle text-warning",
  Approved: "bg-success-subtle text-success",
  PickedUp: "bg-info-subtle text-info",
  Completed: "bg-primary-subtle text-primary",
  Cancelled: "bg-secondary-subtle text-secondary",
  Rejected: "bg-danger-subtle text-danger",
};

const paymentClasses = {
  Paid: "bg-success-subtle text-success",
  Pending: "bg-warning-subtle text-warning",
  Failed: "bg-danger-subtle text-danger",
  Refunded: "bg-secondary-subtle text-secondary",
};

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/booking/owner");
      setBookings(response?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load bookings list.");
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = ["All", "Pending", "Approved", "PickedUp", "Completed", "Cancelled", "Rejected"];
  const paymentOptions = ["All", "Paid", "Pending", "Failed", "Refunded"];

  const filteredBookings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    let filtered = [...bookings];

    if (normalizedSearch) {
      filtered = filtered.filter((booking) => {
        const haystack = [
          booking.bookingNumber,
          booking.equipment?.name,
          booking.customer?.name,
          booking.customer?.email,
          booking.customer?.phone,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      });
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    if (paymentFilter !== "All") {
      filtered = filtered.filter((booking) => booking.paymentStatus === paymentFilter);
    }

    if (sortBy === "oldest") {
      filtered = filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (sortBy === "amount-desc") {
      filtered = filtered.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0));
    } else {
      filtered = filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return filtered;
  }, [bookings, search, statusFilter, paymentFilter, sortBy]);

  const summaryCards = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === "Pending").length;
    const active = bookings.filter((b) => ["Approved", "PickedUp"].includes(b.status)).length;
    const completed = bookings.filter((b) => b.status === "Completed").length;
    const cancelled = bookings.filter((b) => ["Cancelled", "Rejected"].includes(b.status)).length;
    const revenue = bookings
      .filter((b) => b.paymentStatus === "Paid" && b.status === "Completed")
      .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);

    return [
      { title: "Total Bookings", value: total, subtitle: "All bookings", color: "primary" },
      { title: "Pending", value: pending, subtitle: "Awaiting action", color: "warning" },
      { title: "Active", value: active, subtitle: "In progress", color: "info" },
      { title: "Completed", value: completed, subtitle: "Finished", color: "success" },
      { title: "Cancelled", value: cancelled, subtitle: "Cancelled or rejected", color: "secondary" },
      { title: "Revenue", value: formatCurrency(revenue), subtitle: "Completed paid", color: "danger" },
    ];
  }, [bookings]);

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <p className="text-uppercase small fw-semibold text-primary mb-2">Admin workspace</p>
          <h2 className="fw-bold mb-1">All Bookings</h2>
          <p className="text-muted mb-0">Review, track, and manage every booking across the platform.</p>
        </div>
        <button className="btn btn-outline-primary" onClick={fetchBookings}>
          <FaSyncAlt className="me-2" /> Refresh
        </button>
      </div>

      <div className="row g-4 mb-4">
        {summaryCards.map((card) => (
          <div className="col-12 col-md-6 col-xl-2" key={card.title}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-1">{card.title}</h6>
                    <h3 className={`text-${card.color} fw-bold mb-0`}>{card.value}</h3>
                  </div>
                  <span className={`badge bg-${card.color}-subtle text-${card.color}`}>
                    {card.subtitle}
                  </span>
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
              <label className="form-label fw-semibold">Search Booking</label>
              <div className="position-relative">
                <FaMagnifyingGlass className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  className="form-control ps-5"
                  placeholder="Search by booking number, equipment, customer"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-2">
              <label className="form-label fw-semibold">Status</label>
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-6 col-lg-2">
              <label className="form-label fw-semibold">Payment</label>
              <select className="form-select" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                {paymentOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-6 col-lg-2">
              <label className="form-label fw-semibold">Sort by</label>
              <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="amount-desc">Amount: High to Low</option>
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
          <p className="mt-3 text-muted">Loading bookings list...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <FaDollarSign className="fs-1 text-muted mb-3 mx-auto" />
          <h4 className="fw-semibold mb-2">No bookings found</h4>
          <p className="text-muted mb-0">Try adjusting the search or filter criteria.</p>
        </div>
      ) : (
        <div className="table-responsive card border-0 shadow-sm rounded-4 overflow-hidden">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Booking</th>
                <th>Equipment</th>
                <th>Customer</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Created</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td>
                    <div className="fw-semibold">{booking.bookingNumber || booking._id}</div>
                  </td>
                  <td>
                    <div className="fw-semibold">{booking.equipment?.name || "Equipment"}</div>
                    <div className="text-muted small">{booking.equipment?.category || "—"}</div>
                  </td>
                  <td>
                    <div className="fw-semibold">{booking.customer?.name || "—"}</div>
                    <div className="text-muted small">{booking.customer?.email || "—"}</div>
                  </td>
                  <td>
                    <div className="small">{formatDate(booking.startDate)}</div>
                    <div className="text-muted small">→ {formatDate(booking.returnDate || booking.endDate)}</div>
                  </td>
                  <td>{booking.totalDays || 0}</td>
                  <td>{formatCurrency(booking.totalAmount)}</td>
                  <td>
                    <span className={`badge ${statusClasses[booking.status] || "bg-light text-dark"}`}>
                      {booking.status || "Pending"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${paymentClasses[booking.paymentStatus] || "bg-light text-dark"}`}>
                      {booking.paymentStatus || "Pending"}
                    </span>
                  </td>
                  <td>{formatDate(booking.createdAt)}</td>
                  <td>
                    <div className="d-flex justify-content-end">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        type="button"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedBooking ? (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content rounded-4 border-0">
              <div className="modal-header">
                <h5 className="modal-title">Booking Details</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedBooking(null)} />
              </div>
              <div className="modal-body">
                <div className="row g-4">
                  <div className="col-12 col-md-6">
                    <div className="border rounded-4 p-3 h-100 mb-3">
                      <div className="text-muted small">Booking Number</div>
                      <div className="fw-semibold">{selectedBooking.bookingNumber || selectedBooking._id}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="border rounded-4 p-3 h-100 mb-3">
                      <div className="text-muted small">Status</div>
                      <div className="fw-semibold">{selectedBooking.status || "Pending"}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="border rounded-4 p-3 h-100 mb-3">
                      <div className="text-muted small">Equipment</div>
                      <div className="fw-semibold">{selectedBooking.equipment?.name || "—"}</div>
                      <div className="text-muted small">{selectedBooking.equipment?.category || "—"}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="border rounded-4 p-3 h-100 mb-3">
                      <div className="text-muted small">Customer</div>
                      <div className="fw-semibold">{selectedBooking.customer?.name || "—"}</div>
                      <div className="text-muted small">{selectedBooking.customer?.email || "—"}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="border rounded-4 p-3 h-100 mb-3">
                      <div className="text-muted small">Start Date</div>
                      <div className="fw-semibold">{formatDate(selectedBooking.startDate)}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="border rounded-4 p-3 h-100 mb-3">
                      <div className="text-muted small">Return Date</div>
                      <div className="fw-semibold">{formatDate(selectedBooking.returnDate || selectedBooking.endDate)}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="border rounded-4 p-3 h-100 mb-3">
                      <div className="text-muted small">Total Days</div>
                      <div className="fw-semibold">{selectedBooking.totalDays || 0}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="border rounded-4 p-3 h-100 mb-3">
                      <div className="text-muted small">Total Amount</div>
                      <div className="fw-semibold">{formatCurrency(selectedBooking.totalAmount)}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="border rounded-4 p-3 h-100 mb-3">
                      <div className="text-muted small">Payment Status</div>
                      <div className="fw-semibold">{selectedBooking.paymentStatus || "Pending"}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="border rounded-4 p-3 h-100 mb-3">
                      <div className="text-muted small">Created</div>
                      <div className="fw-semibold">{formatDate(selectedBooking.createdAt)}</div>
                    </div>
                  </div>
                  {selectedBooking.notes ? (
                    <div className="col-12">
                      <div className="border rounded-4 p-3 h-100">
                        <div className="text-muted small">Notes</div>
                        <div className="fw-semibold">{selectedBooking.notes}</div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" type="button" onClick={() => setSelectedBooking(null)}>
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
