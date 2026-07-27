import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCalendarDays,
  FaHeart,
  FaMoneyBillWave,
  FaRegClock,
  FaStar,
  FaTruck,
  FaUser,
} from "react-icons/fa6";
import api from "../../services/api";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/dashboard/customer");
        if (!active) return;
        setSummary(response?.data?.data || {});
      } catch (err) {
        if (!active) return;
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load dashboard data."
        );
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
      {
        title: "Total Bookings",
        value: data.totalBookings ?? 0,
        subtitle: "All your bookings",
        icon: <FaCalendarDays className="fs-4" />,
        color: "primary",
      },
      {
        title: "Active Bookings",
        value: data.activeBookings ?? 0,
        subtitle: "Pending or ongoing",
        icon: <FaTruck className="fs-4" />,
        color: "info",
      },
      {
        title: "Completed Rentals",
        value: data.completedBookings ?? 0,
        subtitle: "Finished successfully",
        icon: <FaRegClock className="fs-4" />,
        color: "success",
      },
      {
        title: "Cancelled Bookings",
        value: data.cancelledBookings ?? 0,
        subtitle: "Cancelled or rejected",
        icon: <FaCalendarDays className="fs-4" />,
        color: "danger",
      },
      {
        title: "Total Spent",
        value: formatCurrency(data.totalSpent),
        subtitle: "Across all bookings",
        icon: <FaMoneyBillWave className="fs-4" />,
        color: "warning",
      },
      {
        title: "Wishlist Items",
        value: data.wishlistCount ?? 0,
        subtitle: "Saved equipment",
        icon: <FaHeart className="fs-4" />,
        color: "secondary",
      },
      {
        title: "Reviews Written",
        value: data.reviewCount ?? 0,
        subtitle: "Your feedback",
        icon: <FaStar className="fs-4" />,
        color: "success",
      },
    ];
  }, [summary]);

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <p className="text-uppercase small fw-semibold text-primary mb-2">
            Customer portal
          </p>
          <h2 className="fw-bold mb-1">Customer Dashboard</h2>
          <p className="text-muted mb-0">
            Explore equipment, bookings, and rentals in a calm, modern workspace.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/customer/equipment" className="btn btn-primary">
            Browse Equipment
          </Link>
          <Link to="/customer/bookings" className="btn btn-outline-primary">
            My Bookings
          </Link>
          <Link to="/customer/wishlist" className="btn btn-outline-primary">
            Wishlist
          </Link>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading dashboard data...</p>
        </div>
      ) : (
        <div className="row g-4 mb-4">
          {cards.map((card) => (
            <div className="col-12 col-md-6 col-xl-3" key={card.title}>
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4 d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-2">{card.title}</h6>
                    <h3 className={`text-${card.color} fw-bold mb-0`}>
                      {card.value}
                    </h3>
                  </div>
                  <span className={`badge bg-${card.color}-subtle text-${card.color}`}>
                    {card.subtitle}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error ? (
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <FaCalendarDays className="text-primary" />
                  <h5 className="fw-bold mb-0">Quick Actions</h5>
                </div>
                <div className="d-grid gap-2">
                  <Link
                    className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                    to="/customer/equipment"
                  >
                    Browse Equipment
                  </Link>
                  <Link
                    className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
                    to="/customer/bookings"
                  >
                    View My Bookings
                  </Link>
                  <Link
                    className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
                    to="/customer/wishlist"
                  >
                    View Wishlist
                  </Link>
                  <Link
                    className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
                    to="/customer/profile"
                  >
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <FaUser className="text-primary" />
                  <h5 className="fw-bold mb-0">Account Summary</h5>
                </div>
                <div className="border rounded-4 p-3 bg-light">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Total Spent</span>
                    <strong>{formatCurrency(summary?.totalSpent)}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Active Bookings</span>
                    <strong>{summary?.activeBookings ?? 0}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Completed Rentals</span>
                    <strong>{summary?.completedBookings ?? 0}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Wishlist Items</span>
                    <strong>{summary?.wishlistCount ?? 0}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Dashboard;
