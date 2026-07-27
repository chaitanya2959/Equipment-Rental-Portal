import { useEffect, useState } from "react";
import { FaBoxOpen, FaUser } from "react-icons/fa6";
import API from "../../services/api";

const paymentStatusClasses = {
  Pending: "bg-warning-subtle text-warning",
  Paid: "bg-success-subtle text-success",
  Failed: "bg-danger-subtle text-danger",
  Refunded: "bg-info-subtle text-info",
};

function Payments() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/booking/owner");
      setBookings(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load payment data.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentUpdate = async (bookingId, paymentStatus) => {
    try {
      setUpdatingId(bookingId);
      await API.put(`/booking/${bookingId}/status`, { paymentStatus });
      setBookings((prev) => prev.map((item) => (item._id === bookingId ? { ...item, paymentStatus } : item)));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to update payment status.");
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

  const filteredBookings = bookings.filter((b) => {
    if (!filter) return true;
    return b.paymentStatus === filter;
  });

  const paymentSummary = {
    total: bookings.length,
    paid: bookings.filter((b) => b.paymentStatus === "Paid").length,
    pending: bookings.filter((b) => b.paymentStatus === "Pending").length,
    refunded: bookings.filter((b) => b.paymentStatus === "Refunded").length,
    totalRevenue: bookings
      .filter((b) => b.paymentStatus === "Paid" || b.status === "Completed")
      .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0),
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <p className="text-uppercase small fw-semibold text-primary mb-2">Owner workspace</p>
          <h2 className="fw-bold mb-1">Payment Management</h2>
          <p className="text-muted mb-0">Track payments, receive rental amounts, and manage deposits.</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-3">
              <div className="small text-muted">Total Revenue</div>
              <div className="fw-bold fs-5 text-success">{formatCurrency(paymentSummary.totalRevenue)}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-3">
              <div className="small text-muted">Paid</div>
              <div className="fw-bold fs-5">{paymentSummary.paid}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-3">
              <div className="small text-muted">Pending</div>
              <div className="fw-bold fs-5 text-warning">{paymentSummary.pending}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-3">
              <div className="small text-muted">Refunded</div>
              <div className="fw-bold fs-5 text-info">{paymentSummary.refunded}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-3">
          <div className="d-flex gap-2 flex-wrap">
            <button className={`btn btn-sm ${!filter ? "btn-dark" : "btn-outline-secondary"}`} onClick={() => setFilter("")}>All</button>
            <button className={`btn btn-sm ${filter === "Pending" ? "btn-warning" : "btn-outline-secondary"}`} onClick={() => setFilter("Pending")}>Pending</button>
            <button className={`btn btn-sm ${filter === "Paid" ? "btn-success" : "btn-outline-secondary"}`} onClick={() => setFilter("Paid")}>Paid</button>
            <button className={`btn btn-sm ${filter === "Refunded" ? "btn-info" : "btn-outline-secondary"}`} onClick={() => setFilter("Refunded")}>Refunded</button>
          </div>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <h4 className="fw-semibold mb-2">No payments found</h4>
          <p className="text-muted mb-0">Payments will appear here once bookings are made.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Booking</th>
                <th>Customer</th>
                <th>Equipment</th>
                <th>Amount</th>
                <th>Deposit</th>
                <th>Days</th>
                <th>Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td>
                    <div className="small fw-semibold">{booking.bookingNumber || "—"}</div>
                    <div className="small text-muted">{formatDate(booking.createdAt)}</div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <FaUser className="text-muted" />
                      <div>
                        <div className="small fw-semibold">{booking.customer?.name || "—"}</div>
                        <div className="small text-muted">{booking.customer?.phone || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <FaBoxOpen className="text-muted" />
                      <div>
                        <div className="small fw-semibold">{booking.equipment?.name || "—"}</div>
                        <div className="small text-muted">₹{booking.pricePerDay || 0}/day</div>
                      </div>
                    </div>
                  </td>
                  <td className="fw-semibold">₹{booking.totalAmount || 0}</td>
                  <td>₹{booking.depositAmount || 0}</td>
                  <td>{booking.totalDays || 0}</td>
                  <td>
                    <span className="badge bg-light text-dark">{booking.paymentMethod || "Cash"}</span>
                  </td>
                  <td>
                    <span className={`badge ${paymentStatusClasses[booking.paymentStatus] || "bg-light text-dark"}`}>
                      {booking.paymentStatus || "Pending"}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex flex-column gap-1">
                      {booking.paymentStatus === "Pending" ? (
                        <button
                          className="btn btn-success btn-sm"
                          disabled={updatingId === booking._id}
                          onClick={() => handlePaymentUpdate(booking._id, "Paid")}
                        >
                          {updatingId === booking._id ? "..." : "Receive Payment"}
                        </button>
                      ) : null}
                      {booking.paymentStatus === "Paid" ? (
                        <button
                          className="btn btn-info btn-sm"
                          disabled={updatingId === booking._id}
                          onClick={() => handlePaymentUpdate(booking._id, "Refunded")}
                        >
                          {updatingId === booking._id ? "..." : "Return Deposit"}
                        </button>
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

export default Payments;