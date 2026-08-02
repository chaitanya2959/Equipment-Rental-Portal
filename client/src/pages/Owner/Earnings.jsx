import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FaCalendarDays, FaCircleInfo, FaCoins, FaCreditCard, FaIndianRupeeSign, FaWallet } from "react-icons/fa6";
import API from "../../services/api";
import BackButton from "../../components/Common/BackButton";

const PAYMENT_COLORS = ["#0d6efd", "#22c55e", "#f59e0b", "#ef4444"];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatLabel = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
};

const isRevenueEligible = (booking) => booking?.paymentStatus === "Paid" || ["Approved", "PickedUp", "Completed"].includes(booking?.status);

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
      setError(err.response?.data?.message || "Unable to load earnings data.");
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthBookings = bookings.filter((booking) => {
      const date = new Date(booking.createdAt || booking.updatedAt || booking.startDate);
      return !Number.isNaN(date.getTime()) && date >= startOfMonth;
    });

    const weekRevenue = bookings.reduce((sum, booking) => {
      const date = new Date(booking.createdAt || booking.updatedAt || booking.startDate);
      if (!isRevenueEligible(booking) || Number.isNaN(date.getTime()) || date < startOfWeek) return sum;
      return sum + Number(booking.totalAmount || 0);
    }, 0);

    const monthlyRevenue = monthBookings.reduce((sum, booking) => {
      if (!isRevenueEligible(booking)) return sum;
      return sum + Number(booking.totalAmount || 0);
    }, 0);

    const totalEarnings = bookings.reduce((sum, booking) => {
      if (!isRevenueEligible(booking)) return sum;
      return sum + Number(booking.totalAmount || 0);
    }, 0);

    const pendingPayments = bookings.reduce((sum, booking) => sum + (booking.paymentStatus === "Pending" ? Number(booking.totalAmount || 0) : 0), 0);
    const depositsReceived = bookings.reduce((sum, booking) => {
      if (booking.depositStatus === "Received" || booking.depositStatus === "Paid" || booking.paymentStatus === "Paid") {
        return sum + Number(booking.depositAmount || 0);
      }
      return sum;
    }, 0);

    return {
      monthlyRevenue,
      weekRevenue,
      totalEarnings,
      pendingPayments,
      depositsReceived,
    };
  }, [bookings]);

  const monthlyRevenueData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const monthRevenue = bookings.reduce((sum, booking) => {
        const date = new Date(booking.createdAt || booking.updatedAt || booking.startDate);
        if (!isRevenueEligible(booking) || Number.isNaN(date.getTime())) return sum;
        if (date.getMonth() === monthDate.getMonth() && date.getFullYear() === monthDate.getFullYear()) {
          return sum + Number(booking.totalAmount || 0);
        }
        return sum;
      }, 0);

      return {
        month: monthDate.toLocaleDateString("en-IN", { month: "short" }),
        revenue: monthRevenue,
      };
    });
  }, [bookings]);

  const weeklyRevenueData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const dayDate = new Date(now);
      dayDate.setDate(now.getDate() - (6 - index));
      dayDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(dayDate);
      nextDay.setDate(dayDate.getDate() + 1);

      const revenue = bookings.reduce((sum, booking) => {
        const date = new Date(booking.createdAt || booking.updatedAt || booking.startDate);
        if (!isRevenueEligible(booking) || Number.isNaN(date.getTime())) return sum;
        if (date >= dayDate && date < nextDay) {
          return sum + Number(booking.totalAmount || 0);
        }
        return sum;
      }, 0);

      return {
        day: dayDate.toLocaleDateString("en-IN", { weekday: "short" }),
        revenue,
      };
    });
  }, [bookings]);

  const paymentStatusData = useMemo(() => {
    const counts = bookings.reduce((acc, booking) => {
      const key = booking.paymentStatus || "Pending";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [bookings]);

  const recentTransactions = useMemo(
    () =>
      [...bookings]
        .sort((a, b) => new Date(b.createdAt || b.updatedAt || b.startDate) - new Date(a.createdAt || a.updatedAt || a.startDate))
        .slice(0, 6),
    [bookings],
  );

  const summaryCards = [
    { title: "Monthly Revenue", value: formatCurrency(summary.monthlyRevenue), icon: FaIndianRupeeSign, tone: "primary" },
    { title: "Weekly Revenue", value: formatCurrency(summary.weekRevenue), icon: FaCalendarDays, tone: "success" },
    { title: "Total Earnings", value: formatCurrency(summary.totalEarnings), icon: FaCoins, tone: "info" },
    { title: "Pending Payments", value: formatCurrency(summary.pendingPayments), icon: FaCreditCard, tone: "warning" },
    { title: "Deposits Received", value: formatCurrency(summary.depositsReceived), icon: FaWallet, tone: "danger" },
  ];

  const hasRevenueData = monthlyRevenueData.some((item) => item.revenue > 0) || weeklyRevenueData.some((item) => item.revenue > 0);

  return (
    <div className="container-xxl py-4">
      <div className="owner-page-header d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-2 mb-4">
        <div>
          <p className="owner-page-eyebrow mb-1">Owner Workspace</p>
          <h1 className="owner-page-title mb-1">Earnings Overview</h1>
          <p className="owner-page-subtitle mb-0">Track income, payment flow, and monthly revenue trends.</p>
        </div>
        <span className="badge bg-success-subtle text-success px-3 py-2">Recharts enabled</span>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading earnings data...</p>
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <div className="col-12 col-md-6 col-xl-4" key={card.title}>
                  <div className="card border-0 shadow-sm rounded-4 h-100">
                    <div className="card-body p-4 d-flex justify-content-between align-items-start">
                      <div>
                        <div className="text-muted small mb-2">{card.title}</div>
                        <div className={`fw-bold fs-3 text-${card.tone}`}>{card.value}</div>
                      </div>
                      <div className={`rounded-circle bg-${card.tone}-subtle text-${card.tone} d-inline-flex align-items-center justify-content-center`} style={{ width: 44, height: 44 }}>
                        <Icon />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="row g-4">
            <div className="col-12 col-xl-8">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                    <div>
                      <h4 className="fw-bold mb-1">Revenue Bar Chart</h4>
                      <p className="text-muted mb-0">Monthly revenue across the last six months.</p>
                    </div>
                    <span className="badge bg-light text-dark">ResponsiveContainer</span>
                  </div>
                  <div style={{ width: "100%", height: 320 }}>
                    {hasRevenueData ? (
                      <ResponsiveContainer>
                        <BarChart data={monthlyRevenueData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `${Number(value) / 1000}k`} />
                          <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
                          <Bar dataKey="revenue" fill="#0d6efd" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-100 d-flex align-items-center justify-content-center text-center border rounded-4 bg-light">
                        <div>
                          <FaCircleInfo className="fs-1 text-muted mb-3" />
                          <h5 className="fw-semibold mb-2">No revenue data available</h5>
                          <p className="text-muted mb-0">Revenue charts will appear after paid bookings are available.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-4">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                  <h4 className="fw-bold mb-3">Payment Status</h4>
                  <div style={{ width: "100%", height: 320 }}>
                    {paymentStatusData.length > 0 ? (
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie data={paymentStatusData} dataKey="value" nameKey="name" innerRadius={68} outerRadius={110} paddingAngle={2}>
                            {paymentStatusData.map((entry, index) => (
                              <Cell key={entry.name} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-100 d-flex align-items-center justify-content-center text-muted">No payment statuses yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-8">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                    <div>
                      <h4 className="fw-bold mb-1">Monthly Booking Line Chart</h4>
                      <p className="text-muted mb-0">Weekly revenue trend over the last seven days.</p>
                    </div>
                    <span className="badge bg-light text-dark">Mobile responsive</span>
                  </div>
                  <div style={{ width: "100%", height: 300 }}>
                    {hasRevenueData ? (
                      <ResponsiveContainer>
                        <LineChart data={weeklyRevenueData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
                          <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-100 d-flex align-items-center justify-content-center text-center border rounded-4 bg-light">
                        <div>
                          <FaCircleInfo className="fs-1 text-muted mb-3" />
                          <h5 className="fw-semibold mb-2">No weekly booking data available</h5>
                          <p className="text-muted mb-0">The line chart will populate when bookings start posting revenue.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-4">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                  <h4 className="fw-bold mb-3">Recent Transactions</h4>
                  <div className="d-grid gap-3">
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((booking) => (
                        <div key={booking._id} className="border rounded-4 p-3">
                          <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                            <div>
                              <div className="fw-semibold">{booking.equipment?.name || "Equipment"}</div>
                              <div className="text-muted small">{booking.customer?.name || "Customer"}</div>
                            </div>
                            <span className="badge bg-light text-dark">{booking.paymentStatus || "Pending"}</span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted small">{formatLabel(booking.createdAt || booking.updatedAt || booking.startDate)}</span>
                            <strong>{formatCurrency(booking.totalAmount || 0)}</strong>
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
