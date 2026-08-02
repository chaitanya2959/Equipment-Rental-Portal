import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaArrowRight,
  FaCalendarDay,
  FaCircleCheck,
  FaCircleExclamation,
  FaClock,
  FaHeart,
  FaHouse,
  FaMagnifyingGlass,
  FaShieldHeart,
  FaStar,
  FaWallet,
  FaChartSimple,
} from "react-icons/fa6";
import api from "../../services/api";
import EquipmentCard from "../../components/cards/EquipmentCard";
import "../../components/Customer/customer-layout.css";
import "./customer-home.css";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;

    const fetchDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [summaryRes, equipmentRes, bookingRes, notificationRes] = await Promise.all([
          api.get("/dashboard/customer"),
          api.get("/equipment"),
          api.get("/booking/my-bookings"),
          api.get("/notifications"),
        ]);

        if (!active) return;

        setSummary(summaryRes?.data?.data || {});
        setEquipments(equipmentRes?.data?.data || []);
        setBookings(bookingRes?.data?.data || []);
        setNotifications(notificationRes?.data?.data || []);
      } catch (err) {
        if (!active) return;
        setError(err?.response?.data?.message || err?.message || "Unable to load dashboard data.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDashboard();
    return () => {
      active = false;
    };
  }, []);

  const welcomeName = user?.name || "Customer";

  const trendingEquipments = useMemo(() => {
    return [...equipments]
      .filter((equipment) => equipment.available !== false)
      .sort((a, b) => {
        const scoreA = (a.totalReviews || 0) * 2 + Number(a.averageRating || a.rating || 0);
        const scoreB = (b.totalReviews || 0) * 2 + Number(b.averageRating || b.rating || 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, 3);
  }, [equipments]);

  const featuredEquipments = useMemo(() => {
    return [...equipments]
      .sort((a, b) => {
        const ratingA = a.averageRating ?? a.rating ?? 0;
        const ratingB = b.averageRating ?? b.rating ?? 0;
        const ratingDelta = ratingB - ratingA;
        if (ratingDelta !== 0) return ratingDelta;
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, 3);
  }, [equipments]);

  const activeBookings = useMemo(
    () => bookings.filter((booking) => ["Approved", "PickedUp"].includes(booking.status)),
    [bookings],
  );

  const upcomingReturns = useMemo(() => {
    const today = new Date();
    return bookings
      .filter((booking) => booking.status === "PickedUp" && booking.returnDate && new Date(booking.returnDate) >= today)
      .sort((a, b) => new Date(a.returnDate) - new Date(b.returnDate))
      .slice(0, 3);
  }, [bookings]);

  const latestNotifications = useMemo(() => notifications.slice(0, 4), [notifications]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (search.trim()) {
      navigate(`/customer/equipment?query=${encodeURIComponent(search)}`);
    }
  };

  const renderRail = (items, emptyState, variant = "css-grid") => {
    if (loading) {
      return (
        <div className="equipment-grid">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="home-placeholder-card placeholder-glow" key={index}>
              <div className="placeholder rounded-4 w-100" style={{ aspectRatio: "16 / 10" }} />
              <div className="p-4">
                <div className="placeholder col-8 mb-2" />
                <div className="placeholder col-5 mb-3" />
                <div className="placeholder col-12" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!items.length) {
      return (
        <div className="customer-surface p-5 text-center rounded-4 border">
          <FaCircleExclamation className="fs-1 text-muted mb-3" />
          <h3 className="home-card-title mb-2">{emptyState.title}</h3>
          <p className="home-card-meta mb-0">{emptyState.copy}</p>
        </div>
      );
    }

    return (
      <div className="equipment-grid">
        {items.map((equipment) => (
          <EquipmentCard
            key={equipment._id || equipment.id}
            equipment={equipment}
            detailsUrl={`/customer/equipment/${equipment._id || equipment.id}`}
            bookUrl={`/customer/equipment/${equipment._id || equipment.id}?book=1`}
            variant={variant}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="customer-home">
      {error && <div className="alert alert-danger mb-4">{error}</div>}

      {/* Welcome Banner */}
      <section className="customer-welcome-banner p-4 p-lg-5">
        <div className="row g-4 align-items-center">
          <div className="col-12 col-lg-7">
            <span className="welcome-badge-pill mb-3">
              <FaShieldHeart className="me-2" />
              Premium Customer Marketplace
            </span>
            <h1 className="welcome-title mt-2">
              Welcome back,<br />
              <strong className="text-gradient">{welcomeName}</strong> 👋
            </h1>
            <p className="welcome-subtitle mt-3">
              Find, book, and manage the best equipment for your next rental project.
            </p>
          </div>
          <div className="col-12 col-lg-5 text-center d-none d-lg-block">
            <div className="welcome-illustration-container">
              <svg viewBox="0 0 500 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-100 h-100" style={{ maxHeight: "260px", objectFit: "contain" }}>
                <circle cx="400" cy="120" r="100" fill="url(#circleGrad1)" opacity="0.4" />
                <circle cx="280" cy="240" r="80" fill="url(#circleGrad2)" opacity="0.3" />
                <path d="M420,320 C430,280 460,260 480,260 C460,280 435,300 420,320 Z" fill="#b5ffd9" />
                <path d="M440,320 C450,290 480,280 495,290 C475,300 455,310 440,320 Z" fill="#8effc1" />
                <rect x="50" y="310" width="400" height="12" rx="6" fill="#ece4f7" />
                <rect x="70" y="322" width="360" height="28" rx="4" fill="#dfd6ed" opacity="0.6" />
                <rect x="150" y="90" width="220" height="150" rx="16" fill="#ffffff" stroke="#e1d7f0" strokeWidth="4" />
                <rect x="160" y="100" width="200" height="110" rx="8" fill="#fcfaff" />
                <path d="M240,240 L220,310 L280,310 L260,240 Z" fill="#dfd6ed" />
                <rect x="170" y="110" width="50" height="40" rx="6" fill="#f0e6ff" />
                <rect x="230" y="110" width="120" height="8" rx="4" fill="#7e42eb" />
                <rect x="230" y="125" width="80" height="6" rx="3" fill="#e04a9e" />
                <rect x="230" y="137" width="100" height="4" rx="2" fill="#b5e6ff" />
                <rect x="170" y="160" width="180" height="40" rx="8" fill="#ffffff" stroke="#f0e6ff" strokeWidth="2" />
                <path d="M180,185 Q210,165 240,180 T300,170 T340,185" fill="none" stroke="#7e42eb" strokeWidth="3" strokeLinecap="round" />
                <circle cx="240" cy="180" r="4" fill="#e04a9e" />
                <circle cx="300" cy="170" r="4" fill="#0096c7" />
                <rect x="200" y="295" width="100" height="6" rx="3" fill="#dfd6ed" />
                <rect x="315" y="295" width="16" height="6" rx="3" fill="#dfd6ed" />
                <g transform="translate(90, 110)">
                  <rect width="55" height="55" rx="14" fill="#ffffff" stroke="#f0e6ff" strokeWidth="2" />
                  <path d="M27,12 L30,19 L37,19 L32,24 L34,31 L27,27 L20,31 L22,24 L17,19 L24,19 Z" fill="#ffd700" />
                  <circle cx="20" cy="42" r="3" fill="#7e42eb" />
                  <circle cx="27" cy="42" r="3" fill="#e04a9e" />
                  <circle cx="34" cy="42" r="3" fill="#0096c7" />
                </g>
                <g transform="translate(370, 70)">
                  <rect width="50" height="50" rx="14" fill="#ffffff" stroke="#f0e6ff" strokeWidth="2" />
                  <path d="M25,32 L23.5,30.5 C18.2,25.7 15,22.8 15,19.2 C15,16.2 17.2,14 20.2,14 C21.9,14 23.5,14.8 25,16.1 C26.5,14.8 28.1,14 29.8,14 C32.8,14 35,16.2 35,19.2 C35,22.8 31.8,25.7 26.5,30.5 Z" fill="#e04a9e" />
                </g>
                <defs>
                  <linearGradient id="circleGrad1" x1="300" y1="20" x2="500" y2="220" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#7e42eb" />
                    <stop offset="100%" stopColor="#e04a9e" />
                  </linearGradient>
                  <linearGradient id="circleGrad2" x1="200" y1="160" x2="360" y2="320" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#0096c7" />
                    <stop offset="100%" stopColor="#7e42eb" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Cards Row */}
      <section className="home-stats-row">
        <div className="row g-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="stats-card p-4 h-100">
              <div className="stats-card-header d-flex justify-content-between align-items-start">
                <div className="stats-icon-wrap is-bookings">
                  <FaHouse />
                </div>
                <span className="stats-trend text-success">+2 this month</span>
              </div>
              <div className="stats-card-body mt-3">
                <span className="stats-label">Total Bookings</span>
                <h3 className="stats-value mt-1">
                  {loading ? "..." : (summary?.totalBookings ?? bookings.length)}
                </h3>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="stats-card p-4 h-100">
              <div className="stats-card-header d-flex justify-content-between align-items-start">
                <div className="stats-icon-wrap is-active">
                  <FaCalendarDay />
                </div>
                <span className="stats-trend text-primary">Currently ongoing</span>
              </div>
              <div className="stats-card-body mt-3">
                <span className="stats-label">Active Bookings</span>
                <h3 className="stats-value mt-1">
                  {loading ? "..." : (summary?.activeBookings ?? activeBookings.length)}
                </h3>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="stats-card p-4 h-100">
              <div className="stats-card-header d-flex justify-content-between align-items-start">
                <div className="stats-icon-wrap is-spent">
                  <FaWallet />
                </div>
                <span className="stats-trend text-success">+₹12,400 this month</span>
              </div>
              <div className="stats-card-body mt-3">
                <span className="stats-label">Total Spent</span>
                <h3 className="stats-value mt-1">
                  {loading ? "..." : formatCurrency(summary?.totalSpent ?? 0)}
                </h3>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="stats-card p-4 h-100">
              <div className="stats-card-header d-flex justify-content-between align-items-start">
                <div className="stats-icon-wrap is-wishlist">
                  <FaHeart />
                </div>
                <span className="stats-trend text-purple">+3 new items</span>
              </div>
              <div className="stats-card-body mt-3">
                <span className="stats-label">Wishlist Items</span>
                <h3 className="stats-value mt-1">
                  {loading ? "..." : (summary?.wishlistCount ?? 0)}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Equipment Section */}
      <section className="py-2">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-3">
            <div className="section-title-icon-wrap">
              <FaChartSimple />
            </div>
            <div>
              <h2 className="home-section-title mb-1">Trending Equipment</h2>
              <p className="home-section-subtitle mb-0">Most popular equipment among customers</p>
            </div>
          </div>
          <Link className="view-all-link" to="/customer/equipment">
            View all <FaArrowRight className="ms-1 fs-6" />
          </Link>
        </div>
        {renderRail(
          trendingEquipments,
          {
            title: "No trending equipment available",
            copy: "Check back later for trending marketplace items.",
          },
        )}
      </section>

      {/* Most Engaged Rentals Section */}
      <section className="py-2">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-3">
            <div className="section-title-icon-wrap is-engaged">
              <FaStar />
            </div>
            <div>
              <h2 className="home-section-title mb-1">Most Engaged Rentals</h2>
              <p className="home-section-subtitle mb-0">Highly rated and frequently rented items</p>
            </div>
          </div>
          <Link className="view-all-link" to="/customer/equipment">
            View all <FaArrowRight className="ms-1 fs-6" />
          </Link>
        </div>
        {renderRail(
          featuredEquipments,
          {
            title: "No engaged rentals available",
            copy: "Check back later for active marketplace recommendations.",
          },
        )}
      </section>

      {/* Recent Activity / Bookings & Return Reminders */}
      <section className="py-2">
        <div className="row g-4">
          <div className="col-12 col-xl-6">
            <div className="home-list-card p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                <div>
                  <h2 className="home-section-title mb-1">Active Bookings</h2>
                  <p className="home-section-subtitle mb-0">Your current ongoing rentals</p>
                </div>
                <Link className="view-all-link" to="/customer/bookings">
                  See all bookings <FaArrowRight className="ms-1 fs-6" />
                </Link>
              </div>

              {loading ? (
                <div className="placeholder-glow">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div className="mb-3" key={index}>
                      <div className="placeholder col-12 mb-2" />
                      <div className="placeholder col-8" />
                    </div>
                  ))}
                </div>
              ) : activeBookings.length > 0 ? (
                <div className="list-group">
                  {activeBookings.slice(0, 3).map((booking) => (
                    <div key={booking._id} className="list-group-item p-3 border-0">
                      <div className="d-flex align-items-start gap-3 flex-wrap">
                        <div className="flex-grow-1 min-w-0">
                          <strong className="d-block text-truncate text-dark">{booking.equipment?.name || "Equipment"}</strong>
                          <div className="home-section-subtitle mt-1">
                            {booking.equipment?.category || "Category"} · {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                          </div>
                        </div>
                        <div className="text-end">
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill">{booking.status}</span>
                          <div className="fw-bold text-dark mt-2">{formatCurrency(booking.totalAmount)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <FaCircleExclamation className="fs-1 text-muted mb-3" />
                  <h4 className="home-section-title mb-2">No active bookings</h4>
                  <p className="home-section-subtitle mb-0">Rent equipment from the catalog to see details here.</p>
                </div>
              )}
            </div>
          </div>

          <div className="col-12 col-xl-6">
            <div className="home-list-card p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                <div>
                  <h2 className="home-section-title mb-1">Upcoming Returns</h2>
                  <p className="home-section-subtitle mb-0">Due dates for pickup rentals</p>
                </div>
              </div>

              {loading ? (
                <div className="placeholder-glow">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div className="mb-3" key={index}>
                      <div className="placeholder col-12 mb-2" />
                      <div className="placeholder col-5" />
                    </div>
                  ))}
                </div>
              ) : upcomingReturns.length > 0 ? (
                <div className="list-group">
                  {upcomingReturns.map((booking) => (
                    <div key={booking._id} className="list-group-item p-3 border-0">
                      <div className="d-flex align-items-start gap-3 flex-wrap">
                        <div className="flex-grow-1 min-w-0">
                          <strong className="d-block text-truncate text-dark">{booking.equipment?.name || "Equipment"}</strong>
                          <div className="home-section-subtitle mt-1">Return by {formatDate(booking.returnDate)}</div>
                        </div>
                        <div className="text-end">
                          <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 rounded-pill">Due soon</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <FaClock className="fs-1 text-muted mb-3" />
                  <h4 className="home-section-title mb-2">No upcoming returns</h4>
                  <p className="home-section-subtitle mb-0">No active pickup rentals are currently due.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Notifications / Updates */}
      <section className="py-2 mb-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-3">
            <div className="section-title-icon-wrap">
              <FaClock />
            </div>
            <div>
              <h2 className="home-section-title mb-1">Recent Activity</h2>
              <p className="home-section-subtitle mb-0">Latest account updates and system logs</p>
            </div>
          </div>
          <Link className="view-all-link" to="/customer/notifications">
            View all notifications <FaArrowRight className="ms-1 fs-6" />
          </Link>
        </div>

        {loading ? (
          <div className="row g-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div className="col-12 col-md-6" key={index}>
                <div className="home-review-card placeholder-glow p-4">
                  <div className="placeholder col-6 mb-2" />
                  <div className="placeholder col-12" />
                </div>
              </div>
            ))}
          </div>
        ) : latestNotifications.length > 0 ? (
          <div className="row g-4">
            {latestNotifications.map((notification) => (
              <div className="col-12 col-md-6" key={notification._id || notification.id}>
                <div className="home-review-card p-4 h-100">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <strong className="text-dark">{notification.title || "Update"}</strong>
                    <span className="home-section-subtitle small">{formatDate(notification.createdAt)}</span>
                  </div>
                  <p className="home-section-subtitle mb-0 text-truncate-2">{notification.message}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="customer-surface p-4 text-center rounded-4 border">
            <FaCircleExclamation className="fs-1 text-muted mb-3" />
            <h3 className="home-card-title mb-2">No activity logs yet</h3>
            <p className="home-card-meta mb-0">Logs appear as you place orders and update statuses.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
