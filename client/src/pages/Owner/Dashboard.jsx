import { useEffect, useMemo, useState } from "react";
import {
  FaBoxOpen,
  FaCalendarCheck,
  FaCircleCheck,
  FaClock,
  FaIndianRupeeSign,
  FaTruckFast,
} from "react-icons/fa6";
import { Link } from "react-router-dom";
import API from "../../services/api";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function Dashboard() {
  const [summary, setSummary] = useState({
    totalEquipments: 0,
    activeRentals: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
  });
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [summaryRes, bookingsRes, notificationsRes, equipmentRes, allBookingsRes] = await Promise.all([
        API.get("/dashboard/owner"),
        API.get("/dashboard/owner/recent-bookings"),
        API.get("/dashboard/owner/notifications"),
        API.get("/equipment/my-equipment"),
        API.get("/booking/owner").catch(() => ({ data: { data: [] } })),
      ]);

      const summaryData = summaryRes?.data?.data || {};
      const bookingList = bookingsRes?.data?.data || [];
      const notificationList = notificationsRes?.data?.data || [];
      const equipment = equipmentRes?.data?.data || [];
      const allBookings = allBookingsRes?.data?.data || [];

      const reviewResults = await Promise.all(
        equipment.slice(0, 4).map((eq) =>
          API.get(`/reviews/${eq._id}`).catch(() => ({ data: { data: [] } }))
        )
      );

      const reviewList = reviewResults
        .flatMap((result) => result?.data?.data || [])
        .slice(0, 5);

      setSummary(summaryData);
      setBookings(bookingList);
      setNotifications(notificationList);
      setReviews(reviewList);
      setEquipmentList(equipment);
      setAllBookings(allBookings);
    } catch (err) {
      console.error(err);
      setError("Unable to load dashboard data right now.");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalEquipment = equipmentList.length || summary.totalEquipments || 0;
    const availableEquipment = equipmentList.filter((e) => e.available).length;
    const currentlyRented = allBookings.filter((b) => ["Approved", "PickedUp"].includes(b.status)).length;
    const totalBookings = allBookings.length;
    const activeBookings = allBookings.filter((b) => ["Approved", "PickedUp"].includes(b.status)).length;
    const completedBookings = allBookings.filter((b) => b.status === "Completed").length || summary.completedBookings || 0;
    const totalEarnings = summary.totalRevenue || 0;
    const pendingRequests = allBookings.filter((b) => b.status === "Pending").length || summary.pendingBookings || 0;

    return [
      { label: "Total Equipment", value: totalEquipment, sub: "Listed assets", icon: FaBoxOpen, tone: "purple" },
      { label: "Available Equipment", value: availableEquipment, sub: "Ready to rent", icon: FaCircleCheck, tone: "green" },
      { label: "Currently Rented", value: currentlyRented, sub: "Active rentals", icon: FaTruckFast, tone: "blue" },
      { label: "Total Bookings", value: totalBookings, sub: "All time", icon: FaCalendarCheck, tone: "purple" },
      { label: "Active Bookings", value: activeBookings, sub: "In progress", icon: FaClock, tone: "amber" },
      { label: "Completed Bookings", value: completedBookings, sub: "Finished", icon: FaCircleCheck, tone: "green" },
      { label: "Total Earnings", value: formatCurrency(totalEarnings), sub: "All-time revenue", icon: FaIndianRupeeSign, tone: "purple" },
      { label: "Pending Requests", value: pendingRequests, sub: "Awaiting action", icon: FaClock, tone: "amber" },
    ];
  }, [equipmentList, allBookings, summary]);

  const statusBadge = (status) => {
    const map = {
      Pending: "owner-status-badge pending",
      Approved: "owner-status-badge approved",
      Rejected: "owner-status-badge rejected",
      PickedUp: "owner-status-badge pickedup",
      Completed: "owner-status-badge completed",
      Cancelled: "owner-status-badge cancelled",
    };
    return map[status] || "owner-status-badge pending";
  };

  return (
    <div>
      <div className="owner-page-header d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-2 mb-4">
        <div>
          <p className="owner-page-eyebrow mb-1">Owner Workspace</p>
          <h1 className="owner-page-title mb-1">Owner Dashboard</h1>
          <p className="owner-page-subtitle mb-0">
            Monitor rentals, revenue, activity, and customer feedback in one place.
          </p>
        </div>
        <span className="badge bg-success-subtle text-success px-3 py-2">
          Live insights
        </span>
      </div>

      {error ? (
        <div className="alert alert-danger">{error}</div>
      ) : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status" />
          <p className="mt-3 text-muted">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="row g-3 mb-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div className="col-6 col-md-4 col-xl-3" key={stat.label}>
                  <div className="owner-stat-card">
                    <div className="d-flex align-items-start justify-content-between mb-2">
                      <span className={`owner-stat-icon ${stat.tone}`}>
                        <Icon />
                      </span>
                    </div>
                    <div className="owner-stat-label">{stat.label}</div>
                    <div className="owner-stat-value">{stat.value}</div>
                    <div className="owner-stat-sub">{stat.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent bookings + Reviews */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-xl-8">
              <div className="owner-section-card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Recent Bookings</h5>
                  <Link className="btn btn-sm btn-outline-primary" to="/owner/booking-requests">
                    View all
                  </Link>
                </div>
                <div className="card-body">
                  {bookings.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table align-middle mb-0">
                        <thead>
                          <tr>
                            <th>Customer</th>
                            <th>Equipment</th>
                            <th>Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.map((booking) => (
                            <tr key={booking._id}>
                              <td className="fw-semibold">{booking.customer?.name || "Guest"}</td>
                              <td>{booking.equipment?.name || "Equipment"}</td>
                              <td className="text-muted">{formatDate(booking.createdAt)}</td>
                              <td>
                                <span className={statusBadge(booking.status)}>
                                                  {booking.status || "Pending"}
                                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="owner-empty-card">
                      <FaCalendarCheck className="owner-empty-icon" />
                      <h6 className="fw-bold mb-0">No bookings yet</h6>
                      <p className="mb-0 small">New customer requests will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-4">
              <div className="owner-section-card h-100">
                <div className="card-header">
                  <h5 className="mb-0 fw-bold">Recent Reviews</h5>
                </div>
                <div className="card-body">
                  {reviews.length > 0 ? (
                    reviews.map((review, index) => (
                      <div key={`${review._id || index}`} className="border rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong>{review.customer?.name || "Customer"}</strong>
                          <span className="text-warning">{"★".repeat(review.rating || 0)}</span>
                        </div>
                        <p className="mb-1 text-muted small">{review.review}</p>
                        <small className="text-muted">{formatDate(review.createdAt)}</small>
                      </div>
                    ))
                  ) : (
                    <div className="owner-empty-card">
                      <FaCheckCircle className="owner-empty-icon" />
                      <h6 className="fw-bold mb-0">No reviews yet</h6>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notifications + Performance */}
          <div className="row g-3">
            <div className="col-12 col-xl-7">
              <div className="owner-section-card h-100">
                <div className="card-header">
                  <h5 className="mb-0 fw-bold">Notifications</h5>
                </div>
                <div className="card-body">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notification) => (
                      <div key={notification._id} className="d-flex justify-content-between align-items-start border rounded-3 p-3 mb-2">
                        <div className="min-w-0">
                          <h6 className="mb-1 fw-bold text-truncate">{notification.title}</h6>
                          <p className="mb-0 text-muted small notification-message">{notification.message}</p>
                        </div>
                        <span className="badge bg-light text-dark ms-2">{formatDate(notification.createdAt)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="owner-empty-card">
                      <FaClock className="owner-empty-icon" />
                      <h6 className="fw-bold mb-0">No notifications</h6>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-5">
              <div className="owner-section-card h-100">
                <div className="card-header">
                  <h5 className="mb-0 fw-bold">Performance Snapshot</h5>
                </div>
                <div className="card-body">
                  <div className="border rounded-3 p-3 mb-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Average Rating</span>
                      <strong>{Number(summary.averageRating || 0).toFixed(1)}/5</strong>
                    </div>
                  </div>
                  <div className="border rounded-3 p-3 mb-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Total Equipment</span>
                      <strong>{equipmentList.length || summary.totalEquipments || 0}</strong>
                    </div>
                  </div>
                  <div className="border rounded-3 p-3">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Total Revenue</span>
                      <strong>{formatCurrency(summary.totalRevenue)}</strong>
                    </div>
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