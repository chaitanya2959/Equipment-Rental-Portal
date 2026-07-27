import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";

const statusClasses = {
  Pending: "bg-warning-subtle text-warning",
  Approved: "bg-success-subtle text-success",
  Rejected: "bg-danger-subtle text-danger",
  PickedUp: "bg-info-subtle text-info",
  Completed: "bg-primary-subtle text-primary",
  Cancelled: "bg-secondary-subtle text-secondary",
};

function Earnings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setError(err.response?.data?.message || "Unable to load earnings data.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const isRevenueEligible = (booking) => {
    const paid = booking.paymentStatus === "Paid";
    const settled = ["Approved", "PickedUp", "Completed"].includes(booking.status);
    return paid || settled;
  };

  const getIncomeForRange = (range) => {
    const now = new Date();
    return bookings.reduce((total, booking) => {
      if (!isRevenueEligible(booking)) return total;
      const date = new Date(booking.createdAt || booking.updatedAt || booking.startDate);
      if (!date || Number.isNaN(date.getTime())) return total;

      switch (range) {
        case "today":
          return date.toDateString() === now.toDateString() ? total + Number(booking.totalAmount || 0) : total;
        case "week": {
          const start = new Date(now);
          start.setDate(now.getDate() - 6);
          start.setHours(0, 0, 0, 0);
          return date >= start ? total + Number(booking.totalAmount || 0) : total;
        }
        case "month":
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
            ? total + Number(booking.totalAmount || 0)
            : total;
        case "year":
          return date.getFullYear() === now.getFullYear()
            ? total + Number(booking.totalAmount || 0)
            : total;
        default:
          return total;
      }
    }, 0);
  };

  const chartData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let index = 5; index >= 0; index -= 1) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - index, 1);
      const label = monthDate.toLocaleDateString("en-IN", { month: "short" });
      const value = bookings.reduce((sum, booking) => {
        if (!isRevenueEligible(booking)) return sum;
        const createdAt = new Date(booking.createdAt || booking.updatedAt || booking.startDate);
        if (!createdAt || Number.isNaN(createdAt.getTime())) return sum;
        const sameMonth = createdAt.getMonth() === monthDate.getMonth() && createdAt.getFullYear() === monthDate.getFullYear();
        return sameMonth ? sum + Number(booking.totalAmount || 0) : sum;
      }, 0);
      months.push({ label, value });
    }
    return months;
  }, [bookings]);

  const maxValue = Math.max(...chartData.map((item) => item.value), 1);

  const recentTransactions = useMemo(() => {
    return [...bookings]
      .sort((a, b) => new Date(b.createdAt || b.updatedAt || b.startDate) - new Date(a.createdAt || a.updatedAt || a.startDate))
      .slice(0, 6);
  }, [bookings]);

  const summaryCards = [
    { title: "Today’s Income", value: formatCurrency(getIncomeForRange("today")), subtitle: "Today", color: "primary" },
    { title: "Weekly Income", value: formatCurrency(getIncomeForRange("week")), subtitle: "Last 7 days", color: "success" },
    { title: "Monthly Income", value: formatCurrency(getIncomeForRange("month")), subtitle: "This month", color: "warning" },
    { title: "Yearly Income", value: formatCurrency(getIncomeForRange("year")), subtitle: "This year", color: "info" },
  ];

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-2 mb-4">
        <div>
          <p className="text-uppercase small fw-semibold text-primary mb-2">Owner earnings</p>
          <h2 className="fw-bold mb-1">Earnings Overview</h2>
          <p className="text-muted mb-0">Track income, review revenue trends, and keep an eye on recent transactions.</p>
        </div>
        <span className="badge bg-success-subtle text-success px-3 py-2">Live revenue</span>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading earnings data...</p>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            {summaryCards.map((card) => (
              <div className="col-12 col-md-6 col-xl-3" key={card.title}>
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="text-muted mb-2">{card.title}</h6>
                        <h3 className={`text-${card.color} fw-bold mb-0`}>{card.value}</h3>
                      </div>
                      <span className={`badge bg-${card.color}-subtle text-${card.color}`}>{card.subtitle}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4">
            <div className="col-xl-8">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h4 className="fw-bold mb-1">Revenue Graph</h4>
                      <p className="text-muted mb-0">Income trend across the last 6 months</p>
                    </div>
                    <span className="badge bg-light text-dark">Bootstrap chart</span>
                  </div>

                  <div className="d-flex align-items-end gap-2 mt-4" style={{ minHeight: "260px" }}>
                    {chartData.map((item) => {
                      const height = Math.max((item.value / maxValue) * 180, 12);
                      return (
                        <div key={item.label} className="flex-fill text-center">
                          <div className="d-flex justify-content-center align-items-end" style={{ height: "180px" }}>
                            <div
                              className="w-100 rounded-top bg-gradient"
                              style={{
                                height: `${height}px`,
                                minHeight: "12px",
                                background: "linear-gradient(135deg, #0d6efd, #6f42c1)",
                              }}
                            />
                          </div>
                          <div className="small text-muted mt-2">{item.label}</div>
                          <div className="fw-semibold small">{formatCurrency(item.value)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                  <h4 className="fw-bold mb-3">Recent Transactions</h4>
                  <div className="d-flex flex-column gap-3">
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((booking) => (
                        <div key={booking._id} className="border rounded-4 p-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <strong>{booking.equipment?.name || "Equipment"}</strong>
                            <span className={`badge ${statusClasses[booking.status] || "bg-light text-dark"}`}>
                              {booking.status || "Pending"}
                            </span>
                          </div>
                          <div className="small text-muted mb-1">{booking.customer?.name || "Customer"}</div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="small text-muted">{new Date(booking.createdAt || booking.updatedAt || booking.startDate).toLocaleDateString("en-IN")}</span>
                            <span className="fw-semibold text-dark">{formatCurrency(booking.totalAmount || 0)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted py-4">No transactions found yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Earnings;
