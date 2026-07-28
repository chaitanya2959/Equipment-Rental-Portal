import { useEffect, useMemo, useState } from "react";
import { FaMagnifyingGlass, FaWallet } from "react-icons/fa6";
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

const paymentClass = (status) => {
  const classes = {
    Paid: "bg-success-subtle text-success",
    Pending: "bg-warning-subtle text-warning",
    Failed: "bg-danger-subtle text-danger",
    Refunded: "bg-info-subtle text-info",
  };
  return classes[status] || "bg-light text-dark";
};

function Payments() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/dashboard/admin/bookings");
      setBookings(response?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load payments.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    let filtered = [...bookings];

    if (normalizedSearch) {
      filtered = filtered.filter((b) => {
        const haystack = [b.bookingNumber, b.customer?.name, b.customer?.email, b.equipment?.name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      });
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((b) => b.paymentStatus === statusFilter);
    }

    return filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [bookings, search, statusFilter]);

  const stats = useMemo(() => {
    const total = bookings.reduce((s, b) => s + (b.totalAmount || 0), 0);
    const paid = bookings.filter((b) => b.paymentStatus === "Paid").reduce((s, b) => s + (b.totalAmount || 0), 0);
    const pending = bookings.filter((b) => b.paymentStatus === "Pending").reduce((s, b) => s + (b.totalAmount || 0), 0);
    const failed = bookings.filter((b) => b.paymentStatus === "Failed").reduce((s, b) => s + (b.totalAmount || 0), 0);
    const refunded = bookings.filter((b) => b.paymentStatus === "Refunded").reduce((s, b) => s + (b.totalAmount || 0), 0);
    return [
      { title: "Total Amount", value: formatCurrency(total), subtitle: "All bookings", color: "primary" },
      { title: "Paid", value: formatCurrency(paid), subtitle: "Verified payments", color: "success" },
      { title: "Pending", value: formatCurrency(pending), subtitle: "Awaiting payment", color: "warning" },
      { title: "Failed", value: formatCurrency(failed), subtitle: "Failed payments", color: "danger" },
      { title: "Refunded", value: formatCurrency(refunded), subtitle: "Refunded", color: "info" },
    ];
  }, [bookings]);

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <p className="text-uppercase small fw-semibold text-primary mb-2">Admin workspace</p>
          <h2 className="fw-bold mb-1">Payments</h2>
          <p className="text-muted mb-0">Track payment status and amounts across the platform.</p>
        </div>
        <button className="btn btn-primary" onClick={fetchPayments}>
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
                  placeholder="Search by booking, customer, equipment..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-2">
              <label className="form-label fw-semibold">Status</label>
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
            <div className="col-12 col-lg-2 text-lg-end">
              <div className="text-muted small mb-1">Results</div>
              <div className="fw-bold fs-5">{filteredPayments.length}</div>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading payments...</p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <FaWallet className="fs-1 text-muted mb-3 mx-auto" />
          <h4 className="fw-semibold mb-2">No payments found</h4>
          <p className="text-muted mb-0">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="table-responsive card border-0 shadow-sm rounded-4 overflow-hidden">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Booking</th>
                <th>Customer</th>
                <th>Equipment</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Method</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment._id}>
                  <td>
                    <div className="fw-semibold">{payment.bookingNumber || "—"}</div>
                    <div className="text-muted small">{formatDate(payment.createdAt)}</div>
                  </td>
                  <td>{payment.customer?.name || "—"}</td>
                  <td>{payment.equipment?.name || "—"}</td>
                  <td>{formatCurrency(payment.totalAmount)}</td>
                  <td><span className={`badge ${paymentClass(payment.paymentStatus)}`}>{payment.paymentStatus || "Pending"}</span></td>
                  <td>{payment.paymentMethod || "—"}</td>
                  <td>{formatDate(payment.createdAt)}</td>
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