import { useEffect, useMemo, useState } from "react";
import { FaChartBar, FaChartPie, FaClock, FaDownload, FaFileLines, FaUsers } from "react-icons/fa6";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import api from "../../services/api";

const CHART_COLORS = ["#4361ee", "#4895ef", "#2ec4b6", "#f77f00", "#e63946", "#7209b7", "#f72585"];

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

function Reports() {
  const [bookings, setBookings] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, bookingsRes, equipmentsRes, usersRes] = await Promise.allSettled([
        api.get("/dashboard/admin"),
        api.get("/dashboard/admin/bookings"),
        api.get("/equipment"),
        api.get("/admin/users"),
      ]);

      if (summaryRes.status === "fulfilled") setSummary(summaryRes.value?.data?.data || {});
      if (bookingsRes.status === "fulfilled") setBookings(bookingsRes.value?.data?.data || []);
      if (equipmentsRes.status === "fulfilled") setEquipments(equipmentsRes.value?.data?.data || []);
      if (usersRes.status === "fulfilled") setUsers(usersRes.value?.data?.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const monthlyRevenueData = useMemo(() => {
    const monthly = {};
    bookings
      .filter((b) => b.paymentStatus === "Paid" && b.totalAmount)
      .forEach((b) => {
        if (!b.createdAt) return;
        const d = new Date(b.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthly[key] = (monthly[key] || 0) + b.totalAmount;
      });
    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, amount]) => {
        const [y, m] = month.split("-");
        const date = new Date(Number(y), Number(m) - 1);
        return {
          month: date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
          revenue: amount,
        };
      });
  }, [bookings]);

  const monthlyBookingsData = useMemo(() => {
    const monthly = {};
    bookings.forEach((b) => {
      if (!b.createdAt) return;
      const d = new Date(b.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthly[key] = (monthly[key] || 0) + 1;
    });
    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, count]) => {
        const [y, m] = month.split("-");
        const date = new Date(Number(y), Number(m) - 1);
        return {
          month: date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
          bookings: count,
        };
      });
  }, [bookings]);

  const bookingStatusData = useMemo(() => {
    const counts = { Pending: 0, Approved: 0, PickedUp: 0, Completed: 0, Cancelled: 0, Rejected: 0 };
    bookings.forEach((b) => {
      if (counts[b.status] !== undefined) counts[b.status]++;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }));
  }, [bookings]);

  const equipmentCategoryData = useMemo(() => {
    const catMap = {};
    equipments.forEach((eq) => {
      const cat = eq.category || "Uncategorized";
      catMap[cat] = (catMap[cat] || 0) + 1;
    });
    return Object.entries(catMap)
      .map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [equipments]);

  const userRoleData = useMemo(() => {
    const data = summary || {};
    return [
      { name: "Customers", value: data.totalCustomers ?? users.filter((u) => u.role === "customer").length },
      { name: "Owners", value: data.totalOwners ?? users.filter((u) => u.role === "owner").length },
      { name: "Admins", value: data.totalAdmins ?? users.filter((u) => u.role === "admin").length },
    ];
  }, [summary, users]);

  const handleDownload = (type) => {
    alert(`${type} report download initiated. In a full implementation, this would export CSV/PDF.`);
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <p className="text-uppercase small fw-semibold text-primary mb-2">Admin workspace</p>
          <h2 className="fw-bold mb-1">Reports & Analytics</h2>
          <p className="text-muted mb-0">Comprehensive platform analytics and insights.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-primary btn-sm" onClick={() => handleDownload("Revenue")}>
            <FaDownload className="me-1" /> Revenue Report
          </button>
          <button className="btn btn-outline-success btn-sm" onClick={() => handleDownload("Bookings")}>
            <FaDownload className="me-1" /> Bookings Report
          </button>
          <button className="btn btn-outline-warning btn-sm" onClick={() => handleDownload("Users")}>
            <FaDownload className="me-1" /> Users Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading reports...</p>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            <div className="col-12 col-xl-6">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-white border-0">
                  <h5 className="mb-0">Revenue Overview</h5>
                </div>
                <div className="card-body">
                  {monthlyRevenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={monthlyRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" fontSize={12} tickLine={false} />
                        <YAxis fontSize={12} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
                        <Bar dataKey="revenue" fill="#4361ee" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-muted py-5">No revenue data available yet.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-6">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-white border-0">
                  <h5 className="mb-0">Monthly Bookings Trend</h5>
                </div>
                <div className="card-body">
                  {monthlyBookingsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={monthlyBookingsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" fontSize={12} tickLine={false} />
                        <YAxis fontSize={12} tickLine={false} allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="bookings" stroke="#2ec4b6" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-muted py-5">No booking data available yet.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-white border-0">
                  <h5 className="mb-0">Booking Status</h5>
                </div>
                <div className="card-body">
                  {bookingStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={bookingStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {bookingStatusData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-muted py-5">No booking status data.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-white border-0">
                  <h5 className="mb-0">Equipment Categories</h5>
                </div>
                <div className="card-body">
                  {equipmentCategoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={equipmentCategoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {equipmentCategoryData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-muted py-5">No category data.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-white border-0">
                  <h5 className="mb-0">User Distribution</h5>
                </div>
                <div className="card-body">
                  {userRoleData.some((u) => u.value > 0) ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={userRoleData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {userRoleData.map((entry, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-muted py-5">No user data.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12 col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="text-muted mb-1">Total Users</h6>
                  <h3 className="fw-bold mb-0">{summary?.totalUsers ?? users.length}</h3>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="text-muted mb-1">Total Bookings</h6>
                  <h3 className="fw-bold mb-0">{summary?.totalBookings ?? bookings.length}</h3>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="text-muted mb-1">Total Revenue</h6>
                  <h3 className="fw-bold mb-0">{formatCurrency(summary?.totalRevenue)}</h3>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="text-muted mb-1">Total Equipment</h6>
                  <h3 className="fw-bold mb-0">{summary?.totalEquipments ?? equipments.length}</h3>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;