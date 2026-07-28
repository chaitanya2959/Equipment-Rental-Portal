import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaArrowRight,
  FaBell,
  FaCalendarDay,
  FaCircleCheck,
  FaCircleExclamation,
  FaClock,
  FaHeart,
  FaHouse,
  FaMusic,
  FaCameraRetro,
  FaLeaf,
  FaHammer,
  FaShieldHeart,
  FaTruckFast,
  FaWallet,
  FaStar,
  FaWrench,
} from "react-icons/fa6";
import api from "../../services/api";
import EquipmentCard from "../../components/cards/EquipmentCard";
import "../../components/Customer/customer-layout.css";
import "./customer-home.css";

const categoryIconMap = {
  Construction: FaHammer,
  "Power Tools": FaWrench,
  "Power Backup": FaTruckFast,
  "Home Care": FaHouse,
  Events: FaMusic,
  Photography: FaCameraRetro,
  Garden: FaLeaf,
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function Home() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const sortedByDate = useMemo(
    () => [...equipments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [equipments],
  );

  const recentlyAdded = useMemo(() => sortedByDate.slice(0, 4), [sortedByDate]);

  const featuredEquipments = useMemo(() => {
    return [...equipments]
      .sort((a, b) => {
        const ratingA = a.averageRating ?? a.rating ?? 0;
        const ratingB = b.averageRating ?? b.rating ?? 0;
        const ratingDelta = ratingB - ratingA;
        if (ratingDelta !== 0) return ratingDelta;
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, 4);
  }, [equipments]);

  const popularCategories = useMemo(() => {
    const categoryCounts = equipments.reduce((acc, equipment) => {
      if (!equipment.category) return acc;
      acc[equipment.category] = (acc[equipment.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([category, count]) => ({ category, count }));
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
      .slice(0, 4);
  }, [bookings]);

  const pickupReminders = useMemo(() => {
    const now = new Date();
    return bookings.filter((booking) => {
      if (booking.status !== "Approved" || !booking.startDate) return false;
      const start = new Date(booking.startDate);
      if (Number.isNaN(start.getTime())) return false;
      const hoursRemaining = (start - now) / (1000 * 60 * 60);
      return hoursRemaining >= 0 && hoursRemaining <= 24;
    });
  }, [bookings]);

  const returnReminders = useMemo(() => {
    const now = new Date();
    return bookings.filter((booking) => {
      if (booking.status !== "PickedUp" || !booking.endDate) return false;
      const end = new Date(booking.endDate);
      if (Number.isNaN(end.getTime())) return false;
      const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
      return diffDays === 1;
    });
  }, [bookings]);

  const latestNotifications = useMemo(() => notifications.slice(0, 5), [notifications]);

  const getCategoryIcon = (label) => {
    const Icon = categoryIconMap[label] || FaCircleCheck;
    return <Icon />;
  };

  const renderSummaryCard = (title, value, icon, note) => (
    <div className="col-6 col-md-4 col-xl-2">
      <div className="home-stat-card h-100">
        <div className="d-flex align-items-center gap-3 mb-3 text-primary">{icon}</div>
        <div className="home-card-title">{loading ? <span className="placeholder col-6"></span> : value}</div>
        <div className="home-card-meta">{loading ? <span className="placeholder col-8"></span> : note}</div>
      </div>
    </div>
  );

  const renderEquipmentPlaceholders = (count = 4) =>
    Array.from({ length: count }).map((_, index) => (
      <div className="col-12 col-md-6 col-xl-3" key={index}>
        <div className="home-equipment-card placeholder-glow h-100 p-3">
          <div className="placeholder col-12 mb-3" style={{ height: "180px" }}></div>
          <div className="placeholder col-8 mb-2"></div>
          <div className="placeholder col-6 mb-3"></div>
          <div className="placeholder col-10 mb-2"></div>
          <div className="placeholder col-12"></div>
        </div>
      </div>
    ));

  return (
    <div className="customer-home">
      <section className="home-hero py-4">
        <div className="container-fluid">
          <div className="row g-4 align-items-center">
            <div className="col-12 col-lg-8">
              <div className="home-hero-copy">
                <span className="home-hero-pill">
                  <FaShieldHeart />
                  Customer dashboard
                </span>
                <h1 className="home-hero-title mt-3">Welcome back, {welcomeName}</h1>
                <p className="home-hero-text">
                  All your rental activity, equipment insights, and notifications are shown here from your live account data.
                </p>
                <div className="home-hero-actions mt-4">
                  <Link className="btn btn-primary btn-lg rounded-pill px-4" to="/customer/equipment">
                    Browse equipment
                  </Link>
                  <Link className="btn btn-light btn-lg rounded-pill px-4" to="/customer/bookings">
                    View bookings
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-4">
              <div className="home-hero-panel p-4 h-100">
                <div className="home-search-card p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <p className="eyebrow mb-1">Summary</p>
                      <strong className="home-card-title">Live account status</strong>
                    </div>
                    <FaBell className="text-primary" />
                  </div>
                  <div className="home-card-meta mb-3">
                    {loading ? (
                      <span className="placeholder col-7"></span>
                    ) : (
                      "Your dashboard updates whenever inventory or bookings change."
                    )}
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge rounded-pill bg-primary text-white">
                      Bookings: {loading ? <span className="placeholder col-4"></span> : summary?.totalBookings ?? 0}
                    </span>
                    <span className="badge rounded-pill bg-secondary text-white">
                      Spent: {loading ? <span className="placeholder col-4"></span> : formatCurrency(summary?.totalSpent ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error ? (
            <div className="alert alert-danger mt-4">{error}</div>
          ) : null}

          {pickupReminders.length > 0 || returnReminders.length > 0 ? (
            <div className="row g-3 mt-4">
              {pickupReminders.length > 0 ? (
                <div className="col-12 col-lg-6">
                  <div className="public-reminder">
                    <strong>Pickup reminder</strong>
                    <div className="small mt-1">Your equipment pickup is within 24 hours.</div>
                  </div>
                </div>
              ) : null}
              {returnReminders.length > 0 ? (
                <div className="col-12 col-lg-6">
                  <div className="public-reminder">
                    <strong>Return reminder</strong>
                    <div className="small mt-1">Please return equipment tomorrow.</div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="row g-3 mt-4">
            {renderSummaryCard(
              "Active bookings",
              loading ? null : summary?.activeBookings ?? 0,
              <FaCalendarDay className="fs-4" />,
              "Bookings currently in progress",
            )}
            {renderSummaryCard(
              "Completed rentals",
              loading ? null : summary?.completedBookings ?? 0,
              <FaCircleCheck className="fs-4" />,
              "Successful rentals closed",
            )}
            {renderSummaryCard(
              "Wishlist",
              loading ? null : summary?.wishlistCount ?? 0,
              <FaHeart className="fs-4" />,
              "Items you have saved",
            )}
            {renderSummaryCard(
              "Pending reviews",
              loading ? null : summary?.reviewCount ?? 0,
              <FaStar className="fs-4" />,
              "Feedback waiting for you",
            )}
            <div className="col-6 col-md-4 col-xl-2">
              <div className="home-stat-card h-100">
                <div className="d-flex align-items-center gap-3 mb-3 text-primary">
                  <FaWallet className="fs-4" />
                </div>
                <div className="home-card-title">
                  {loading ? <span className="placeholder col-6"></span> : formatCurrency(summary?.totalSpent ?? 0)}
                </div>
                <div className="home-card-meta">Total spent on rentals</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-4">
        <div className="container-fluid">
          <div className="d-flex align-items-end justify-content-between gap-3 mb-4 flex-wrap">
            <div>
              <p className="eyebrow mb-2">Recently added equipment</p>
              <h2 className="home-section-title">Latest inventory from owners</h2>
            </div>
            <Link className="btn btn-outline-primary rounded-pill" to="/customer/equipment">
              View all equipment
              <FaArrowRight />
            </Link>
          </div>

          <div className="row g-4">
            {loading
              ? renderEquipmentPlaceholders(4)
              : recentlyAdded.length > 0
              ? recentlyAdded.map((equipment) => (
                  <EquipmentCard
                    key={equipment._id || equipment.id}
                    equipment={equipment}
                    detailsUrl={`/customer/equipment/${equipment._id || equipment.id}`}
                    bookUrl={`/customer/equipment/${equipment._id || equipment.id}?book=1`}
                  />
                ))
              : (
                <div className="col-12">
                  <div className="home-list-card p-4 text-center">
                    <FaCircleExclamation className="fs-1 text-muted mb-3" />
                    <h3 className="home-card-title mb-2">No equipment available</h3>
                    <p className="home-card-meta mb-0">
                      New inventory will appear here once owners add approved equipment.
                    </p>
                  </div>
                </div>
              )}
          </div>
        </div>
      </section>

      <section className="py-4 bg-light">
        <div className="container-fluid">
          <div className="row g-4">
            <div className="col-12 col-xl-8">
              <div className="d-flex align-items-end justify-content-between gap-3 mb-4 flex-wrap">
                <div>
                  <p className="eyebrow mb-2">Featured equipment</p>
                  <h2 className="home-section-title">Top-rated rentals to consider</h2>
                </div>
                <Link className="btn btn-outline-primary rounded-pill" to="/customer/equipment">
                  Browse featured
                  <FaArrowRight />
                </Link>
              </div>

              <div className="row g-4">
                {loading
                  ? renderEquipmentPlaceholders(4)
                  : featuredEquipments.length > 0
                  ? featuredEquipments.map((equipment) => (
                      <EquipmentCard
                        key={equipment._id || equipment.id}
                        equipment={equipment}
                        detailsUrl={`/customer/equipment/${equipment._id || equipment.id}`}
                        bookUrl={`/customer/equipment/${equipment._id || equipment.id}?book=1`}
                      />
                    ))
                  : (
                    <div className="col-12">
                      <div className="home-list-card p-4 text-center">
                        <FaCircleExclamation className="fs-1 text-muted mb-3" />
                        <h3 className="home-card-title mb-2">No featured equipment yet</h3>
                        <p className="home-card-meta mb-0">Featured rentals will populate once your marketplace grows.</p>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="col-12 col-xl-4">
              <div className="home-category-card p-4 h-100">
                <p className="eyebrow mb-2">Popular categories</p>
                <h2 className="home-card-title mb-4">What customers are renting</h2>
                <div className="row g-3">
                  {loading
                    ? Array.from({ length: 6 }).map((_, index) => (
                        <div className="col-6" key={index}>
                          <div className="home-category-card placeholder-glow p-3">
                            <span className="placeholder col-8"></span>
                            <span className="placeholder col-5"></span>
                          </div>
                        </div>
                      ))
                    : popularCategories.length > 0
                    ? popularCategories.map(({ category, count }) => (
                        <div className="col-6" key={category}>
                          <div className="home-category-card p-3 h-100">
                            <div className="home-category-icon mb-3">{getCategoryIcon(category)}</div>
                            <strong className="d-block mb-1">{category}</strong>
                            <span className="home-card-meta">{count} items</span>
                          </div>
                        </div>
                      ))
                    : (
                      <div className="col-12 text-center">
                        <div className="home-list-card p-4">
                          <FaCircleExclamation className="fs-1 text-muted mb-3" />
                          <h3 className="home-card-title mb-2">No category data</h3>
                          <p className="home-card-meta mb-0">Categories will appear after equipment is live.</p>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-4">
        <div className="container-fluid">
          <div className="row g-4">
            <div className="col-12 col-xl-6">
              <div className="home-list-card p-4 h-100">
                <div className="d-flex align-items-end justify-content-between gap-3 mb-4 flex-wrap">
                  <div>
                    <p className="eyebrow mb-2">Active bookings</p>
                    <h2 className="home-section-title">Your current rentals</h2>
                  </div>
                  <Link className="btn btn-outline-primary rounded-pill" to="/customer/bookings">
                    See all bookings
                    <FaArrowRight />
                  </Link>
                </div>

                {loading ? (
                  <div className="placeholder-glow">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div className="mb-3" key={index}>
                        <div className="placeholder col-12 mb-2"></div>
                        <div className="placeholder col-8"></div>
                      </div>
                    ))}
                  </div>
                ) : activeBookings.length > 0 ? (
                  <div className="list-group">
                    {activeBookings.slice(0, 4).map((booking) => (
                      <div key={booking._id} className="list-group-item list-group-item-action rounded-4 mb-3">
                        <div className="d-flex align-items-start gap-3 flex-wrap">
                          <div className="flex-grow-1 min-w-0">
                            <strong>{booking.equipment?.name || "Equipment"}</strong>
                            <div className="home-card-meta">{booking.equipment?.category || "Category"} · {formatDate(booking.startDate)} – {formatDate(booking.endDate)}</div>
                          </div>
                          <div className="text-end">
                            <div className="badge rounded-pill bg-success">{booking.status}</div>
                            <div className="home-card-meta mt-2">{formatCurrency(booking.totalAmount)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <FaCircleExclamation className="fs-1 text-muted mb-3" />
                    <h3 className="home-card-title mb-2">No active bookings</h3>
                    <p className="home-card-meta mb-0">Start a rental from the equipment catalog.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 col-xl-6">
              <div className="home-list-card p-4 h-100">
                <div className="d-flex align-items-end justify-content-between gap-3 mb-4 flex-wrap">
                  <div>
                    <p className="eyebrow mb-2">Upcoming returns</p>
                    <h2 className="home-section-title">Return reminders</h2>
                  </div>
                </div>

                {loading ? (
                  <div className="placeholder-glow">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div className="mb-3" key={index}>
                        <div className="placeholder col-12 mb-2"></div>
                        <div className="placeholder col-5"></div>
                      </div>
                    ))}
                  </div>
                ) : upcomingReturns.length > 0 ? (
                  <div className="list-group">
                    {upcomingReturns.map((booking) => (
                      <div key={booking._id} className="list-group-item list-group-item-action rounded-4 mb-3">
                        <div className="d-flex align-items-start gap-3 flex-wrap">
                          <div className="flex-grow-1 min-w-0">
                            <strong>{booking.equipment?.name || "Equipment"}</strong>
                            <div className="home-card-meta">Return by {formatDate(booking.returnDate)}</div>
                          </div>
                          <div className="text-end">
                            <div className="badge rounded-pill bg-info text-dark">Due soon</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <FaClock className="fs-1 text-muted mb-3" />
                    <h3 className="home-card-title mb-2">No upcoming returns</h3>
                    <p className="home-card-meta mb-0">Your current rentals do not have return dates soon.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-4 bg-light">
        <div className="container-fluid">
          <div className="d-flex align-items-end justify-content-between gap-3 mb-4 flex-wrap">
            <div>
              <p className="eyebrow mb-2">Recent notifications</p>
              <h2 className="home-section-title">What’s new in your account</h2>
            </div>
            <Link className="btn btn-outline-primary rounded-pill" to="/customer/notifications">
              View all notifications
              <FaArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="placeholder-glow">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="home-rated-card p-4 mb-3 placeholder-glow">
                  <div className="placeholder col-6 mb-2"></div>
                  <div className="placeholder col-12"></div>
                </div>
              ))}
            </div>
          ) : latestNotifications.length > 0 ? (
            <div className="row g-4">
              {latestNotifications.map((notification) => (
                <div className="col-12 col-md-6" key={notification._id || notification.id}>
                  <div className="home-rated-card p-4 h-100">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <strong>{notification.title || "Notification"}</strong>
                      <span className="text-muted small">{formatDate(notification.createdAt)}</span>
                    </div>
                    <p className="home-card-meta mb-0">{notification.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="home-list-card p-4 text-center">
              <FaCircleExclamation className="fs-1 text-muted mb-3" />
              <h3 className="home-card-title mb-2">No notifications yet</h3>
              <p className="home-card-meta mb-0">Notifications appear when your bookings or equipment status changes.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
