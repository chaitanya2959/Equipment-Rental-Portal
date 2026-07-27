import { useEffect, useState } from "react";
import API from "../../services/api";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [summaryRes, bookingsRes, notificationsRes, equipmentRes] = await Promise.all([
        API.get("/dashboard/owner"),
        API.get("/dashboard/owner/recent-bookings"),
        API.get("/dashboard/owner/notifications"),
        API.get("/equipment/my-equipment"),
      ]);

      const summaryData = summaryRes?.data?.data || {};
      const bookingList = bookingsRes?.data?.data || [];
      const notificationList = notificationsRes?.data?.data || [];
      const equipmentList = equipmentRes?.data?.data || [];

      const monthlyIncome = bookingList.reduce((total, booking) => {
        const bookingDate = new Date(booking.createdAt);
        const now = new Date();
        const isCurrentMonth =
          bookingDate.getMonth() === now.getMonth() &&
          bookingDate.getFullYear() === now.getFullYear();

        return isCurrentMonth && booking.paymentStatus === "Paid"
          ? total + Number(booking.totalAmount || 0)
          : total;
      }, 0);

      const reviewResults = await Promise.all(
        equipmentList.slice(0, 4).map((equipment) =>
          API.get(`/reviews/${equipment._id}`).catch(() => ({ data: { data: [] } }))
        )
      );

      const reviewList = reviewResults
        .flatMap((result) => result?.data?.data || [])
        .slice(0, 5);

      setSummary({
        ...summaryData,
        monthlyIncome,
      });
      setBookings(bookingList);
      setNotifications(notificationList);
      setReviews(reviewList);
    } catch (err) {
      console.error(err);
      setError("Unable to load dashboard data right now.");
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

  const formatDate = (value) =>
    new Date(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const statusClass = (status) => {
    const classes = {
      Pending: "bg-warning text-dark",
      Approved: "bg-success",
      PickedUp: "bg-primary",
      Completed: "bg-secondary",
      Cancelled: "bg-danger",
    };

    return classes[status] || "bg-light text-dark";
  };

  const cards = [
    {
      title: "Total Equipment",
      value: summary.totalEquipments,
      subtitle: "Listed assets",
      color: "primary",
    },
    {
      title: "Pending Bookings",
      value: summary.pendingBookings,
      subtitle: "Awaiting approval",
      color: "warning",
    },
    {
      title: "Current Rentals",
      value: summary.activeRentals,
      subtitle: "Active now",
      color: "info",
    },
    {
      title: "Completed Rentals",
      value: summary.completedBookings,
      subtitle: "Finished successfully",
      color: "success",
    },
    {
      title: "Revenue",
      value: formatCurrency(summary.totalRevenue),
      subtitle: "All-time earnings",
      color: "danger",
    },
    {
      title: "Monthly Income",
      value: formatCurrency(summary.monthlyIncome),
      subtitle: "This month",
      color: "dark",
    },
  ];

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-2 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Owner Dashboard</h2>
          <p className="text-muted mb-0">
            Monitor rentals, revenue, activity, and customer feedback in one place.
          </p>
        </div>
        <span className="badge bg-success-subtle text-success px-3 py-2 fs-6">
          Live insights
        </span>
      </div>

      {error ? (
        <div className="alert alert-danger">{error}</div>
      ) : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            {cards.map((card) => (
              <div className="col-12 col-md-6 col-xl-4" key={card.title}>
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

          <div className="row g-4">
            <div className="col-xl-8">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Recent Bookings</h5>
                  <a href="/owner/booking-requests" className="btn btn-sm btn-outline-primary">
                    View all
                  </a>
                </div>
                <div className="card-body">
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
                        {bookings.length > 0 ? (
                          bookings.map((booking) => (
                            <tr key={booking._id}>
                              <td>{booking.customer?.name || "Guest"}</td>
                              <td>{booking.equipment?.name || "Equipment"}</td>
                              <td>{formatDate(booking.createdAt)}</td>
                              <td>
                                <span className={`badge ${statusClass(booking.status)}`}>
                                  {booking.status || "Pending"}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center text-muted py-4">
                              No bookings found yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-white border-0">
                  <h5 className="mb-0">Recent Reviews</h5>
                </div>
                <div className="card-body">
                  {reviews.length > 0 ? (
                    reviews.map((review, index) => (
                      <div key={`${review._id || index}`} className="border rounded p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong>{review.customer?.name || "Customer"}</strong>
                          <span className="text-warning">{"★".repeat(review.rating || 0)}</span>
                        </div>
                        <p className="mb-1 text-muted small">{review.review}</p>
                        <small className="text-muted">{formatDate(review.createdAt)}</small>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted py-4">No reviews yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4 mt-1">
            <div className="col-xl-7">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-white border-0">
                  <h5 className="mb-0">Notifications</h5>
                </div>
                <div className="card-body">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div key={notification._id} className="d-flex justify-content-between align-items-start border rounded p-3 mb-3">
                        <div>
                          <h6 className="mb-1">{notification.title}</h6>
                          <p className="mb-0 text-muted small">{notification.message}</p>
                        </div>
                        <span className="badge bg-light text-dark">{formatDate(notification.createdAt)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted py-4">No notifications right now.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-xl-5">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-white border-0">
                  <h5 className="mb-0">Performance Snapshot</h5>
                </div>
                <div className="card-body">
                  <div className="border rounded p-3 mb-3">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Average Rating</span>
                      <strong>{summary.averageRating || 0}/5</strong>
                    </div>
                  </div>
                  <div className="border rounded p-3 mb-3">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Monthly Income</span>
                      <strong>{formatCurrency(summary.monthlyIncome)}</strong>
                    </div>
                  </div>
                  <div className="border rounded p-3">
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