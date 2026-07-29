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
  FaHammer,
  FaCameraRetro,
  FaLeaf,
  FaMagnifyingGlass,
  FaMusic,
  FaShieldHeart,
  FaStar,
  FaTruckFast,
  FaWallet,
  FaWrench,
} from "react-icons/fa6";
import api from "../../services/api";
import EquipmentCard from "../../components/cards/EquipmentCard";
import SearchBar from "../../components/Customer/SearchBar";
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
  const [reviews, setReviews] = useState([]);
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

  const sortedByDate = useMemo(
    () => [...equipments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [equipments],
  );

  const recentlyAdded = useMemo(() => sortedByDate.slice(0, 4), [sortedByDate]);

  const trendingEquipments = useMemo(() => {
    return [...equipments]
      .filter((equipment) => equipment.available !== false)
      .sort((a, b) => {
        const scoreA = (a.totalReviews || 0) * 2 + Number(a.averageRating || a.rating || 0);
        const scoreB = (b.totalReviews || 0) * 2 + Number(b.averageRating || b.rating || 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, 4);
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

  const recommendedEquipments = useMemo(() => {
    const preferredCategories = new Set(popularCategories.slice(0, 3).map((item) => item.category));
    const fallback = [...equipments]
      .filter((equipment) => equipment.available !== false)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const preferred = fallback.filter((equipment) => preferredCategories.has(equipment.category));
    const pool = [...preferred, ...fallback.filter((equipment) => !preferredCategories.has(equipment.category))];
    return pool.slice(0, 4);
  }, [equipments, popularCategories]);

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

  const latestNotifications = useMemo(() => notifications.slice(0, 4), [notifications]);

  const reviewSeedIds = useMemo(() => {
    const ids = [...trendingEquipments, ...recentlyAdded, ...featuredEquipments]
      .map((equipment) => equipment._id || equipment.id)
      .filter(Boolean);
    return [...new Set(ids)].slice(0, 4);
  }, [featuredEquipments, recentlyAdded, trendingEquipments]);

  useEffect(() => {
    let active = true;

    const fetchReviews = async () => {
      if (!reviewSeedIds.length) {
        setReviews([]);
        return;
      }

      try {
        const responses = await Promise.all(
          reviewSeedIds.map((equipmentId) =>
            api.get(`/reviews/${equipmentId}`).catch(() => ({ data: { data: [] } })),
          ),
        );

        if (!active) return;

        const feed = responses.flatMap((response) => response?.data?.data || []);
        feed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setReviews(feed.slice(0, 4));
      } catch {
        if (active) setReviews([]);
      }
    };

    fetchReviews();
    return () => {
      active = false;
    };
  }, [reviewSeedIds]);

  const heroStats = [
    {
      title: "Live listings",
      value: equipments.length,
      note: "Verified equipment in the catalog",
      icon: <FaShieldHeart />,
    },
    {
      title: "Active bookings",
      value: summary?.activeBookings ?? activeBookings.length,
      note: "Rentals currently in progress",
      icon: <FaCalendarDay />,
    },
    {
      title: "Total spent",
      value: formatCurrency(summary?.totalSpent ?? 0),
      note: "Across confirmed rentals",
      icon: <FaWallet />,
    },
    {
      title: "Saved items",
      value: summary?.wishlistCount ?? 0,
      note: "Shortlist from the marketplace",
      icon: <FaHeart />,
    },
  ];

  const summaryTiles = [
    {
      title: "Completed rentals",
      value: summary?.completedBookings ?? 0,
      icon: <FaCircleCheck className="fs-4" />,
    },
    {
      title: "Pending reviews",
      value: summary?.reviewCount ?? 0,
      icon: <FaStar className="fs-4" />,
    },
    {
      title: "Unread notifications",
      value: latestNotifications.filter((item) => !item.isRead).length,
      icon: <FaMagnifyingGlass className="fs-4" />,
    },
  ];

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigate(`/customer/equipment?query=${encodeURIComponent(search)}`);
  };

  const handleCategoryJump = (category) => {
    navigate(`/customer/equipment?category=${encodeURIComponent(category)}`);
  };

  const renderRail = (items, emptyState, variant = "compact") => {
    if (loading) {
      return (
        <div className="home-rail d-flex gap-4 overflow-auto pb-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="home-rail-item placeholder-glow" key={index}>
              <div className="home-placeholder-card">
                <div className="placeholder rounded-4 w-100" style={{ aspectRatio: "16 / 11" }} />
                <div className="p-3">
                  <div className="placeholder col-8 mb-2" />
                  <div className="placeholder col-5 mb-3" />
                  <div className="placeholder col-12 mb-2" />
                  <div className="placeholder col-10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!items.length) {
      return (
        <div className="customer-surface p-4 text-center">
          <FaCircleExclamation className="fs-1 text-muted mb-3" />
          <h3 className="home-card-title mb-2">{emptyState.title}</h3>
          <p className="home-card-meta mb-0">{emptyState.copy}</p>
        </div>
      );
    }

    return (
      <div className="home-rail d-flex gap-4 overflow-auto pb-2">
        {items.map((equipment) => (
          <div className="home-rail-item" key={equipment._id || equipment.id}>
            <EquipmentCard
              equipment={equipment}
              detailsUrl={`/customer/equipment/${equipment._id || equipment.id}`}
              bookUrl={`/customer/equipment/${equipment._id || equipment.id}?book=1`}
              variant={variant}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="customer-home">
      <section className="home-hero customer-hero-card p-4 p-lg-5">
        <div className="row g-4 align-items-center">
          <div className="col-12 col-xl-7">
            <span className="home-hero-pill">
              <FaShieldHeart />
              Premium customer marketplace
            </span>
            <h1 className="home-hero-title mt-3">Rent premium equipment from one polished workspace.</h1>
            <p className="home-hero-text">
              Search live inventory, compare verified listings, keep track of bookings, and stay ahead of pickup and return dates.
            </p>

            <div className="home-search-panel mt-4 p-3 p-lg-4">
              <SearchBar
                className="customer-searchbar-compact customer-searchbar-large"
                placeholder="Search equipment, owners, categories, or locations..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onSubmit={handleSearchSubmit}
              />
              <div className="home-chip-row mt-3">
                {popularCategories.length > 0 ? (
                  popularCategories.map(({ category, count }) => {
                    const Icon = categoryIconMap[category] || FaCircleCheck;
                    return (
                      <button
                        className="home-chip"
                        key={category}
                        type="button"
                        onClick={() => handleCategoryJump(category)}
                      >
                        <Icon />
                        <span>{category}</span>
                        <small>{count}</small>
                      </button>
                    );
                  })
                ) : (
                  <span className="home-card-meta">Category chips will appear once inventory is available.</span>
                )}
              </div>
            </div>

            <div className="home-hero-actions mt-4">
              <Link className="btn btn-primary btn-lg rounded-pill px-4" to="/customer/equipment">
                Browse equipment
                <FaArrowRight />
              </Link>
              <Link className="btn btn-outline-secondary btn-lg rounded-pill px-4" to="/customer/bookings">
                View bookings
              </Link>
              <Link className="btn btn-outline-secondary btn-lg rounded-pill px-4" to="/customer/wishlist">
                Wishlist
              </Link>
            </div>
          </div>

          <div className="col-12 col-xl-5">
            <div className="home-hero-panel h-100">
              <div className="home-summary-grid">
                {heroStats.map((item) => (
                  <div className="home-summary-card" key={item.title}>
                    <div className="home-summary-icon">{item.icon}</div>
                    <div className="home-card-meta">{item.title}</div>
                    <div className="home-summary-value">{item.value}</div>
                    <div className="home-card-meta">{item.note}</div>
                  </div>
                ))}
              </div>

              <div className="home-hero-stack mt-4">
                <div className="home-hero-stack-row">
                  <span>Pickup reminders</span>
                  <strong>{pickupReminders.length}</strong>
                </div>
                <div className="home-hero-stack-row">
                  <span>Return reminders</span>
                  <strong>{returnReminders.length}</strong>
                </div>
                <div className="home-hero-stack-row">
                  <span>Unread notifications</span>
                  <strong>{latestNotifications.filter((item) => !item.isRead).length}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error ? <div className="alert alert-danger mt-4 mb-0">{error}</div> : null}
      </section>

      <section className="py-2">
        <div className="d-flex align-items-end justify-content-between gap-3 mb-3 flex-wrap">
          <div>
            <p className="eyebrow mb-2">Trending equipment</p>
            <h2 className="home-section-title">Most engaged rentals</h2>
          </div>
          <Link className="btn btn-outline-secondary rounded-pill" to="/customer/equipment">
            View all
            <FaArrowRight />
          </Link>
        </div>
        {renderRail(
          trendingEquipments,
          {
            title: "No trending equipment yet",
            copy: "Trending rentals will appear once owner listings gather activity.",
          },
        )}
      </section>

      <section className="py-2">
        <div className="d-flex align-items-end justify-content-between gap-3 mb-3 flex-wrap">
          <div>
            <p className="eyebrow mb-2">Recently added</p>
            <h2 className="home-section-title">Fresh inventory from owners</h2>
          </div>
          <Link className="btn btn-outline-secondary rounded-pill" to="/customer/equipment">
            View all equipment
            <FaArrowRight />
          </Link>
        </div>
        {renderRail(
          recentlyAdded,
          {
            title: "No recent listings",
            copy: "New inventory will show up here as owners add approved equipment.",
          },
        )}
      </section>

      <section className="py-2">
        <div className="row g-4">
          <div className="col-12 col-xl-7">
            <div className="d-flex align-items-end justify-content-between gap-3 mb-3 flex-wrap">
              <div>
                <p className="eyebrow mb-2">Featured equipment</p>
                <h2 className="home-section-title">Top-rated rentals to consider</h2>
              </div>
              <Link className="btn btn-outline-secondary rounded-pill" to="/customer/equipment">
                Browse featured
                <FaArrowRight />
              </Link>
            </div>

            <div className="row g-4">
              {loading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div className="col-12 col-md-6" key={index}>
                      <div className="home-placeholder-card placeholder-glow">
                        <div className="placeholder rounded-top-4 w-100" style={{ aspectRatio: "16 / 11" }} />
                        <div className="p-3">
                          <div className="placeholder col-8 mb-2" />
                          <div className="placeholder col-5 mb-3" />
                          <div className="placeholder col-12 mb-2" />
                          <div className="placeholder col-10" />
                        </div>
                      </div>
                    </div>
                  ))
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
                    <div className="customer-surface p-4 text-center">
                      <FaCircleExclamation className="fs-1 text-muted mb-3" />
                      <h3 className="home-card-title mb-2">No featured equipment yet</h3>
                      <p className="home-card-meta mb-0">
                        Featured rentals will surface once the marketplace has more activity.
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </div>

          <div className="col-12 col-xl-5">
            <div className="home-side-panel p-4 h-100">
              <p className="eyebrow mb-2">Recommended for you</p>
              <h2 className="home-section-title mb-4">A tighter fit for your current activity</h2>
              {renderRail(
                recommendedEquipments,
                {
                  title: "No recommendations yet",
                  copy: "Recommendations will appear once the catalog has enough live inventory.",
                },
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-2">
        <div className="d-flex align-items-end justify-content-between gap-3 mb-3 flex-wrap">
          <div>
            <p className="eyebrow mb-2">Latest reviews</p>
            <h2 className="home-section-title">Recent customer feedback</h2>
          </div>
          <Link className="btn btn-outline-secondary rounded-pill" to="/customer/equipment">
            Open catalog
            <FaArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="row g-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="col-12 col-lg-6" key={index}>
                <div className="home-review-card placeholder-glow p-4">
                  <div className="placeholder col-5 mb-3" />
                  <div className="placeholder col-12 mb-2" />
                  <div className="placeholder col-10 mb-2" />
                  <div className="placeholder col-7" />
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="row g-4">
            {reviews.map((review) => (
              <div className="col-12 col-lg-6" key={review._id}>
                <div className="home-review-card p-4 h-100">
                  <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                    <div>
                      <div className="home-review-name">{review.customer?.name || "Customer"}</div>
                      <div className="home-card-meta">{review.equipment?.name || "Equipment"}</div>
                    </div>
                    <div className="home-rating-pill">
                      <FaStar />
                      <span>{Number(review.rating || 0).toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="home-review-copy mb-3">{review.review || "No review text provided."}</p>
                  <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                    <span className="home-card-meta">{formatDate(review.createdAt)}</span>
                    {review.ownerReply?.trim() ? (
                      <span className="badge bg-success-subtle text-success">Owner replied</span>
                    ) : (
                      <span className="badge bg-light text-dark">Latest feedback</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="customer-surface p-4 text-center">
            <FaCircleExclamation className="fs-1 text-muted mb-3" />
            <h3 className="home-card-title mb-2">No reviews yet</h3>
            <p className="home-card-meta mb-0">Reviews will appear here after customers complete rentals and submit feedback.</p>
          </div>
        )}
      </section>

      <section className="py-2">
        <div className="row g-4">
          <div className="col-12 col-xl-6">
            <div className="home-list-card p-4 h-100">
              <div className="d-flex align-items-end justify-content-between gap-3 mb-4 flex-wrap">
                <div>
                  <p className="eyebrow mb-2">Active bookings</p>
                  <h2 className="home-section-title">Your current rentals</h2>
                </div>
                <Link className="btn btn-outline-secondary rounded-pill" to="/customer/bookings">
                  See all bookings
                  <FaArrowRight />
                </Link>
              </div>

              {loading ? (
                <div className="placeholder-glow">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div className="mb-3" key={index}>
                      <div className="placeholder col-12 mb-2" />
                      <div className="placeholder col-8" />
                    </div>
                  ))}
                </div>
              ) : activeBookings.length > 0 ? (
                <div className="list-group">
                  {activeBookings.slice(0, 4).map((booking) => (
                    <div key={booking._id} className="list-group-item list-group-item-action mb-3">
                      <div className="d-flex align-items-start gap-3 flex-wrap">
                        <div className="flex-grow-1 min-w-0">
                          <strong>{booking.equipment?.name || "Equipment"}</strong>
                          <div className="home-card-meta">
                            {booking.equipment?.category || "Category"} · {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="badge bg-success-subtle text-success">{booking.status}</div>
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
                      <div className="placeholder col-12 mb-2" />
                      <div className="placeholder col-5" />
                    </div>
                  ))}
                </div>
              ) : upcomingReturns.length > 0 ? (
                <div className="list-group">
                  {upcomingReturns.map((booking) => (
                    <div key={booking._id} className="list-group-item list-group-item-action mb-3">
                      <div className="d-flex align-items-start gap-3 flex-wrap">
                        <div className="flex-grow-1 min-w-0">
                          <strong>{booking.equipment?.name || "Equipment"}</strong>
                          <div className="home-card-meta">Return by {formatDate(booking.returnDate)}</div>
                        </div>
                        <div className="text-end">
                          <div className="badge bg-info-subtle text-info">Due soon</div>
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
      </section>

      <section className="py-2">
        <div className="d-flex align-items-end justify-content-between gap-3 mb-3 flex-wrap">
          <div>
            <p className="eyebrow mb-2">Recent notifications</p>
            <h2 className="home-section-title">What’s new in your account</h2>
          </div>
          <Link className="btn btn-outline-secondary rounded-pill" to="/customer/notifications">
            View all notifications
            <FaArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="row g-4">
            {Array.from({ length: 4 }).map((_, index) => (
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
          <div className="customer-surface p-4 text-center">
            <FaCircleExclamation className="fs-1 text-muted mb-3" />
            <h3 className="home-card-title mb-2">No notifications yet</h3>
            <p className="home-card-meta mb-0">Notifications appear when bookings or equipment statuses change.</p>
          </div>
        )}
      </section>

      <section className="py-2 pb-4">
        <div className="row g-3">
          {summaryTiles.map((tile) => (
            <div className="col-12 col-md-4" key={tile.title}>
              <div className="home-summary-strip p-4 h-100 d-flex align-items-center justify-content-between gap-3">
                <div>
                  <div className="home-card-meta mb-1">{tile.title}</div>
                  <div className="home-summary-value">{tile.value}</div>
                </div>
                <div className="home-summary-icon">{tile.icon}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;

