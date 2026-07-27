import { useEffect, useMemo, useState } from "react";
import { FaBoxOpen, FaChartBar, FaCheckCircle, FaClock, FaDollarSign, FaList, FaPauseCircle, FaUsers, FaWallet } from "react-icons/fa6";
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

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const [summaryRes, bookingsRes] = await Promise.all([
          api.get("/dashboard/admin"),
          api.get("/booking/owner"),
        ]);

        if (!active) return;
        setSummary(summaryRes?.data?.data || {});
        setBookings(bookingsRes?.data?.data || []);
      } catch (err) {
        if (!active) return;
        setError(err?.response?.data?.message || err?.message || "Unable to load admin dashboard data.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDashboard();
    return () => {
      active = false;
    };
  }, []);

  const cards = useMemo(() => {
    const data = summary || {};
    return [
      { title: "Total Users", value: data.totalUsers ?? 0, subtitle: "All registered accounts", icon: <FaUsers className="fs-4" />, color: "primary" },
      { title: "Customers", value: data.totalCustomers ?? 0, subtitle: "Customer accounts", icon: <FaUsers className="fs-4" />, color: "info" },
      { title: "Owners", value: data.totalOwners ?? 0, subtitle: "Owner accounts", icon: <FaUsers className="fs-4" />, color: "success" },
      { title: "Admins", value: data.totalAdmins ?? 0, subtitle: "Admin accounts", icon: <FaUsers className="fs-4" />, color: "warning" },
      { title: "Total Equipment", value: data.totalEquipments ?? 0, subtitle: "Listed inventory", icon: <FaBoxOpen className="fs-4" />, color: "primary" },
      { title: "Total Bookings", value: data.totalBookings ?? 0, subtitle: "All bookings", icon: <FaList className="fs-4" />, color: "info" },
      { title: "Pending Bookings", value: data.pendingBookings ?? 0, subtitle: "Awaiting action", icon: <FaClock className="fs-4" />, color: "warning" },
      { title: "Completed Bookings", value: data.completedBookings ?? 0, subtitle: "Finished rentals", icon: <FaCheckCircle className="fs-4" />, color: "success" },
      { title: "Total Revenue", value: formatCurrency(data.totalRevenue), subtitle: "All-time earnings", icon: <FaDollarSign className="fs-4" />, color: "danger" },
    ];
  }, [summary]);

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 8);
  }, [bookings]);

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

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-2 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Admin Dashboard</h2>
          <p className="text-muted mb-0">
            Monitor platform-wide statistics, user activity, and booking metrics.
          </p>
        </div>
        <span className="badge bg-success-subtle text-success px-3 py-2 fs-6">
          Live insights
        </span>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading admin dashboard data...</p>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            {cards.map((card) => (
              <div className="col-12 col-md-6 col-xl-3" key={card.title}>
                <div className="card shadow-sm border-0 h-100">
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

          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Bookings</h5>
              <a href="/admin/bookings" className="btn btn-sm btn-outline-primary">
                View all
              </a>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Booking</th>
                      <th>Equipment</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.length > 0 ? (
                      recentBookings.map((booking) => (
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
                          <td>{formatCurrency(booking.totalAmount)}</td>
                          <td>
                            <span className={`badge ${statusClass(booking.status)}`}>
                              {booking.status || "Pending"}
                            </span>
                          </td>
                          <td>{formatDate(booking.createdAt)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          No bookings found yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
