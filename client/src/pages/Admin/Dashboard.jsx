import { useEffect, useMemo, useState } from "react";
import {
  FaBan,
  FaBox,
  FaBoxOpen,
  FaChartBar,
  FaCircleCheck,
  FaClock,
  FaDollarSign,
  FaFileLines,
  FaFolderOpen,
  FaList,
  FaMagnifyingGlass,
  FaPlus,
  FaStar,
  FaXmark,
  FaUsers,
  FaWallet,
} from "react-icons/fa6";
import { Link } from "react-router-dom";
import api from "../../services/api";

const COLORS = {
  primary: "#4361ee",
  success: "#2ec4b6",
  warning: "#f77f00",
  danger: "#e63946",
  info: "#4895ef",
  dark: "#1d3557",
  gray: "#adb5bd",
  purple: "#7209b7",
  orange: "#f77f00",
  teal: "#2ec4b6",
  pink: "#f72585",
};

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

const statusClass = (status) => {
  const classes = {
    Pending: "bg-warning-subtle text-warning",
    Approved: "bg-success-subtle text-success",
    PickedUp: "bg-info-subtle text-info",
    Completed: "bg-primary-subtle text-primary",
    Cancelled: "bg-secondary-subtle text-secondary",
    Rejected: "bg-danger-subtle text-danger",
    Active: "bg-success-subtle text-success",
    Inactive: "bg-danger-subtle text-danger",
  };
  return classes[status] || "bg-light text-dark";
};

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const results = await Promise.allSettled([
          api.get("/dashboard/admin"),
          api.get("/dashboard/admin/bookings"),
          api.get("/equipment"),
          api.get("/admin/users"),
          api.get("/categories"),
          api.get("/notifications"),
        ]);

        if (!active) return;

        results.forEach((result, idx) => {
          if (result.status === "fulfilled") {
            switch (idx) {
              case 0:
                setSummary(result.value?.data?.data || {});
                break;
              case 1:
                setBookings(result.value?.data?.data || []);
                break;
              case 2:
                setEquipments(result.value?.data?.data || []);
                break;
              case 3:
                setUsers(result.value?.data?.data || []);
                break;
              case 4:
                setCategories(result.value?.data?.data || []);
                break;
              case 5:
                setNotifications(result.value?.data?.data || []);
                break;
              default:
                break;
            }
          }
        });
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

  const equipmentReviews = useMemo(() => {
    const list = [];
    equipments.forEach((eq) => {
      if (eq.totalReviews > 0) {
        list.push({
          equipment: eq.name,
          rating: Number(eq.averageRating || 0).toFixed(1),
          totalReviews: eq.totalReviews || 0,
        });
      }
    });
    return list;
  }, [equipments]);

  const cards = useMemo(() => {
    const data = summary || {};
    const availableCount = equipments.filter((e) => e.available || e.status === "Available").length;
    const bookingsApproved = bookings.filter((b) => b.status === "Approved").length;
    const bookingsCancelled = bookings.filter((b) => b.status === "Cancelled").length;
    const reviewsCount = equipments.reduce((s, e) => s + (e.totalReviews || 0), 0);
    const avgRating = equipments.length > 0
      ? (equipments.reduce((s, e) => s + (e.averageRating || 0), 0) / equipments.length).toFixed(1)
      : "0.0";

    return [
      { title: "Total Users", value: data.totalUsers ?? 0, subtitle: "All registered", icon: <FaUsers />, color: "primary" },
      { title: "Customers", value: data.totalCustomers ?? 0, subtitle: "Customer accounts", icon: <FaUsers />, color: "info" },
      { title: "Owners", value: data.totalOwners ?? 0, subtitle: "Owner accounts", icon: <FaUsers />, color: "success" },
      { title: "Admins", value: data.totalAdmins ?? 0, subtitle: "Admin accounts", icon: <FaUsers />, color: "warning" },
      { title: "Total Equipment", value: data.totalEquipments ?? equipments.length, subtitle: "Listed inventory", icon: <FaBoxOpen />, color: "primary" },
      { title: "Available Equipment", value: availableCount, subtitle: "Ready to rent", icon: <FaCircleCheck />, color: "success" },
      { title: "Total Categories", value: data.totalCategories ?? categories.length, subtitle: "Equipment types", icon: <FaFolderOpen />, color: "purple" },
      { title: "Total Bookings", value: data.totalBookings ?? 0, subtitle: "All bookings", icon: <FaList />, color: "info" },
      { title: "Pending Bookings", value: data.pendingBookings ?? 0, subtitle: "Awaiting action", icon: <FaClock />, color: "warning" },
      { title: "Approved Bookings", value: bookingsApproved, subtitle: "Approved rentals", icon: <FaCircleCheck />, color: "success" },
      { title: "Completed Bookings", value: data.completedBookings ?? 0, subtitle: "Finished rentals", icon: <FaCircleCheck />, color: "primary" },
      { title: "Cancelled Bookings", value: bookingsCancelled, subtitle: "Cancelled", icon: <FaXmark />, color: "gray" },
      { title: "Total Revenue", value: formatCurrency(data.totalRevenue), subtitle: "All-time earnings", icon: <FaDollarSign />, color: "danger" },
      { title: "Pending Payments", value: data.pendingPayments ?? 0, subtitle: "Unpaid bookings", icon: <FaWallet />, color: "orange" },
      { title: "Average Rating", value: avgRating, subtitle: "Platform rating", icon: <FaStar />, color: "orange" },
      { title: "Reviews Count", value: reviewsCount, subtitle: "Total reviews", icon: <FaStar />, color: "pink" },
    ];
  }, [summary, equipments, bookings, categories]);

  // Charts Data
  const bookingStatusData = useMemo(() => {
    const counts = { Pending: 0, Approved: 0, PickedUp: 0, Completed: 0, Cancelled: 0, Rejected: 0 };
    bookings.forEach((b) => {
      if (counts[b.status] !== undefined) counts[b.status]++;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }));
  }, [bookings]);

  const userDistributionData = useMemo(() => {
    const data = summary || {};
    return [
      { name: "Customers", value: data.totalCustomers ?? users.filter((u) => u.role === "customer").length },
      { name: "Owners", value: data.totalOwners ?? users.filter((u) => u.role === "owner").length },
      { name: "Admins", value: data.totalAdmins ?? users.filter((u) => u.role === "admin").length },
    ];
  }, [summary, users]);

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

  const revenueData = useMemo(() => {
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

  const recentBookings = useMemo(() => [...bookings].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 8), [bookings]);

  const recentUsers = useMemo(() => [...users].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 8), [users]);

  const recentEquipments = useMemo(() => [...equipments].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 8), [equipments]);

  const latestNotifications = useMemo(() => [...notifications].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 8), [notifications]);

  const metricRows = [
    {
      title: "Revenue Overview",
      data: revenueData.map((item) => ({ label: item.month, value: item.revenue, color: COLORS.primary })),
      format: formatCurrency,
    },
    {
      title: "Monthly Bookings",
      data: monthlyBookingsData.map((item) => ({ label: item.month, value: item.bookings, color: COLORS.success })),
      format: (value) => value,
    },
    {
      title: "Booking Status",
      data: bookingStatusData,
      format: (value) => value,
    },
    {
      title: "User Distribution",
      data: userDistributionData.map((item, index) => ({ ...item, color: CHART_COLORS[index % CHART_COLORS.length] })),
      format: (value) => value,
    },
  ];

  const renderMiniBars = (items, formatValue) => {
    const maxValue = Math.max(...items.map((item) => Number(item.value || 0)), 1);

    return items.length > 0 ? (
      <div className="d-grid gap-3">
        {items.map((item) => {
          const width = `${Math.max(6, (Number(item.value || 0) / maxValue) * 100)}%`;
          return (
            <div key={item.label || item.name} className="d-grid gap-2">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold small">{item.label || item.name}</span>
                <span className="text-muted small">{formatValue(item.value)}</span>
              </div>
              <div className="progress" style={{ height: "10px" }}>
                <div
                  className="progress-bar"
                  style={{
                    width,
                    backgroundColor: item.color || COLORS.primary,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="text-center text-muted py-5">No data available yet.</div>
    );
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <p className="text-uppercase small fw-semibold text-primary mb-2">Admin workspace</p>
          <h2 className="fw-bold mb-1">Admin Dashboard</h2>
          <p className="text-muted mb-0">Monitor platform statistics, activity, and metrics.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Link to="/admin/categories" className="btn btn-outline-primary btn-sm"><FaPlus className="me-1"/> Add Category</Link>
          <Link to="/admin/equipments" className="btn btn-outline-success btn-sm"><FaBoxOpen className="me-1"/> Add Equipment</Link>
          <Link to="/admin/bookings" className="btn btn-outline-info btn-sm"><FaList className="me-1"/> View Bookings</Link>
          <Link to="/admin/reports" className="btn btn-outline-warning btn-sm"><FaFileLines className="me-1"/> Generate Report</Link>
          <Link to="/admin/notifications" className="btn btn-outline-dark btn-sm"><FaMagnifyingGlass className="me-1"/> View Notifications</Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"/>
          <p className="mt-3 text-muted">Loading admin dashboard...</p>
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
                      <span className={`text-${card.color} fs-4 opacity-75`}>{card.icon}</span>
                    </div>
                    <p className="text-muted small mt-2 mb-0">{card.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4 mb-4">
            {metricRows.map((section) => (
              <div className="col-12 col-xl-6" key={section.title}>
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{section.title}</h5>
                    <span className="badge bg-light text-dark">{section.data.length} items</span>
                  </div>
                  <div className="card-body">
                    {section.title === "Booking Status" || section.title === "User Distribution"
                      ? renderMiniBars(
                          section.data.map((item) => ({
                            label: item.name,
                            value: item.value,
                            color: item.color,
                          })),
                          section.format
                        )
                      : renderMiniBars(
                          section.data.map((item) => ({
                            label: item.label,
                            value: item.value,
                            color: item.color,
                          })),
                          section.format
                        )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4 mb-4">
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Recent Bookings</h5>
                  <Link to="/admin/bookings" className="btn btn-sm btn-outline-primary">View all</Link>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Booking</th>
                          <th>Equipment</th>
                          <th>Customer</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Payment</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBookings.length > 0 ? (
                          recentBookings.map((booking) => (
                            <tr key={booking._id}>
                              <td>
                                <div className="fw-semibold">{booking.bookingNumber || "—"}</div>
                                <div className="text-muted small">{booking._id}</div>
                              </td>
                              <td>{booking.equipment?.name || "—"}</td>
                              <td>{booking.customer?.name || "—"}</td>
                              <td>{formatCurrency(booking.totalAmount)}</td>
                              <td><span className={`badge ${statusClass(booking.status)}`}>{booking.status || "Pending"}</span></td>
                              <td><span className={`badge ${booking.paymentStatus === "Paid" ? "bg-success-subtle text-success" : booking.paymentStatus === "Pending" ? "bg-warning-subtle text-warning" : booking.paymentStatus === "Failed" ? "bg-danger-subtle text-danger" : "bg-light text-dark"}`}>{booking.paymentStatus || "Pending"}</span></td>
                              <td>{formatDate(booking.createdAt)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="7" className="text-center text-muted py-4">No bookings found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-12 col-lg-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Recent Users</h5>
                  <Link to="/admin/users" className="btn btn-sm btn-outline-primary">View all</Link>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Role</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentUsers.length > 0 ? (
                          recentUsers.map((user) => (
                            <tr key={user._id}>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px", fontSize: "0.8rem" }}>
                                    {(user.name || "U").charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="fw-semibold small">{user.name || "—"}</div>
                                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>{user.email || "—"}</div>
                                  </div>
                                </div>
                              </td>
                              <td><span className={`badge ${user.role === "admin" ? "bg-danger-subtle text-danger" : user.role === "owner" ? "bg-success-subtle text-success" : "bg-info-subtle text-info"}`}>{user.role || "customer"}</span></td>
                              <td><span className={`badge ${user.isActive ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>{user.isActive ? "Active" : "Inactive"}</span></td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="3" className="text-center text-muted py-4">No users found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Recent Equipment</h5>
                  <Link to="/admin/equipments" className="btn btn-sm btn-outline-primary">View all</Link>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Equipment</th>
                          <th>Category</th>
                          <th>Price/Day</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentEquipments.length > 0 ? (
                          recentEquipments.map((eq) => (
                            <tr key={eq._id}>
                              <td>
                                <div className="fw-semibold small">{eq.name || "—"}</div>
                                <div className="text-muted" style={{ fontSize: "0.75rem" }}>{eq.brand || "—"}</div>
                              </td>
                              <td><span className="badge bg-light text-dark">{eq.category || "—"}</span></td>
                              <td>{formatCurrency(eq.pricePerDay)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="3" className="text-center text-muted py-4">No equipment found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Latest Notifications</h5>
                  <Link to="/admin/notifications" className="btn btn-sm btn-outline-primary">View all</Link>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Notification</th>
                          <th>Type</th>
                          <th>Read</th>
                        </tr>
                      </thead>
                      <tbody>
                        {latestNotifications.length > 0 ? (
                          latestNotifications.map((n) => (
                            <tr key={n._id}>
                              <td>
                                <div className="fw-semibold small">{n.title || "—"}</div>
                                <div className="text-muted" style={{ fontSize: "0.75rem" }}>{n.message || "—"}</div>
                              </td>
                              <td><span className="badge bg-light text-dark">{n.type || "—"}</span></td>
                              <td><span className={`badge ${n.isRead ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"}`}>{n.isRead ? "Read" : "Unread"}</span></td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="3" className="text-center text-muted py-4">No notifications.</td></tr>
                        )}
                      </tbody>
                    </table>
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

export default Dashboard;
