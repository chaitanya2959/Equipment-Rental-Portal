import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowTrendUp,
  FaBagShopping,
  FaCalendarDays,
  FaChartPie,
  FaCircleCheck,
  FaCircleExclamation,
  FaClock,
  FaCoins,
  FaEye,
  FaHouse,
  FaListCheck,
  FaRegClock,
  FaStar,
  FaWallet,
} from "react-icons/fa6";
import { getCustomerStats } from "../../services/bookingService";
import BackButton from "../../components/Common/BackButton";
import "./rental-stats.css";

const imageBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const placeholderImage = "https://via.placeholder.com/800x520?text=No+Image";

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

const formatMonth = (year, month) => {
  if (!year || !month) return "—";
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
};

const getImageUrl = (images) => {
  const image = Array.isArray(images) ? images[0] : images;
  if (!image) return placeholderImage;
  if (/^https?:\/\//i.test(image)) return image;
  return `${imageBaseUrl}/uploads/${image}`;
};

const STATUS_COLORS = {
  Pending: "warning",
  Approved: "success",
  PickedUp: "info",
  Completed: "primary",
  Rejected: "danger",
  Cancelled: "secondary",
};

const STATUS_ORDER = ["Pending", "Approved", "PickedUp", "Completed", "Rejected", "Cancelled"];

function RentalStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getCustomerStats();
        if (!active) return;
        setStats(data);
      } catch (fetchError) {
        if (!active) return;
        setError(fetchError?.response?.data?.message || "Unable to load rental statistics.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchStats();
    return () => {
      active = false;
    };
  }, []);

  const overviewCards = useMemo(() => {
    if (!stats?.overview) return [];
    const o = stats.overview;
    return [
      { title: "Total Rentals", value: o.totalBookings, subtitle: "All-time bookings", color: "primary", icon: FaListCheck },
      { title: "Active Rentals", value: o.activeBookings, subtitle: "Currently ongoing", color: "info", icon: FaCalendarDays },
      { title: "Upcoming Rentals", value: o.upcomingBookings, subtitle: "Awaiting start", color: "warning", icon: FaClock },
      { title: "Completed Rentals", value: o.completedBookings, subtitle: "Finished rentals", color: "success", icon: FaCircleCheck },
      { title: "Cancelled Rentals", value: o.cancelledBookings, subtitle: "Cancelled or rejected", color: "danger", icon: FaCircleExclamation },
      { title: "Total Rental Spending", value: formatCurrency(o.totalSpent), subtitle: "Paid bookings", color: "dark", icon: FaWallet },
      { title: "Total Rental Days", value: o.totalRentalDays, subtitle: "Across all rentals", color: "primary", icon: FaCalendarDays },
      { title: "Total Reviews Given", value: o.totalReviewsGiven, subtitle: "Equipment reviews", color: "warning", icon: FaStar },
    ];
  }, [stats]);

  const statusDistributionMap = useMemo(() => {
    const map = {};
    if (stats?.statusDistribution) {
      stats.statusDistribution.forEach((item) => {
        map[item.status] = item.count;
      });
    }
    return map;
  }, [stats]);

  const totalForDistribution = useMemo(
    () => Object.values(statusDistributionMap).reduce((sum, count) => sum + count, 0),
    [statusDistributionMap],
  );

  const maxActivityCount = useMemo(() => {
    if (!stats?.rentalActivity?.length) return 0;
    return Math.max(...stats.rentalActivity.map((item) => item.count));
  }, [stats]);

  const hasBookings = stats?.overview?.totalBookings > 0;

  if (loading) {
    return (
      <div className="container-xxl py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading your rental statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-xxl py-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-xxl py-4">
      {/* Header */}
      <div className="bookings-header mb-4">
        <div className="row align-items-center g-3">
          <div className="col-12 col-lg-auto">
            <BackButton label="Back" />
          </div>
          <div className="col-12 col-lg">
            <div className="bookings-title-block">
              <p className="bookings-label text-uppercase small fw-semibold text-primary mb-2">Customer workspace</p>
              <h2 className="bookings-title fw-bold mb-1">Rental Stats</h2>
              <p className="bookings-subtitle text-muted mb-0">Your rental activity at a glance</p>
            </div>
          </div>
          <div className="col-12 col-lg-auto">
            <span className="bookings-count-badge">
              <FaChartPie className="me-1" />
              {stats?.overview?.totalBookings ?? 0} Total
            </span>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!hasBookings ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <div className="customer-empty-state">
            <FaChartPie className="customer-empty-icon mb-3" style={{ fontSize: "3rem" }} />
            <h3 className="fw-bold mb-2">No rental statistics available yet</h3>
            <p className="text-muted mb-4" style={{ maxWidth: "32rem", margin: "0 auto" }}>
              You haven't completed any rentals yet. Start exploring equipment to see your rental activity here.
            </p>
            <Link className="btn btn-primary rounded-pill px-4" to="/customer/equipment">
              <FaHouse className="me-2" />
              Browse Equipment
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* 1. Overview Statistics */}
          <section className="mb-4">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="section-title-icon-wrap">
                <FaListCheck />
              </div>
              <div>
                <h2 className="home-section-title mb-1">Overview Statistics</h2>
                <p className="home-section-subtitle mb-0">A summary of your rental activity</p>
              </div>
            </div>
            <div className="row g-4">
              {overviewCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div className="col-12 col-sm-6 col-xl-3" key={card.title}>
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <span className={`stats-icon-wrap is-${card.color}`}>
                            <Icon />
                          </span>
                          <span className={`badge bg-${card.color}-subtle text-${card.color}`}>{card.subtitle}</span>
                        </div>
                        <h6 className="text-muted mb-1">{card.title}</h6>
                        <h3 className={`text-${card.color} fw-bold mb-0`}>{card.value}</h3>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="row g-4">
            {/* Left Column */}
            <div className="col-12 col-xl-8">
              {/* 2. Rental Activity */}
              <section className="mb-4">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div className="section-title-icon-wrap">
                        <FaArrowTrendUp />
                      </div>
                      <div>
                        <h3 className="home-section-title mb-1">Rental Activity</h3>
                        <p className="home-section-subtitle mb-0">Your bookings over time</p>
                      </div>
                    </div>

                    {stats?.rentalActivity?.length ? (
                      <div className="rental-activity-chart">
                        <div className="activity-bars">
                          {stats.rentalActivity.map((item) => {
                            const heightPercent = maxActivityCount > 0 ? (item.count / maxActivityCount) * 100 : 0;
                            return (
                              <div className="activity-bar-item" key={`${item.year}-${item.month}`}>
                                <div className="activity-bar-value">{item.count}</div>
                                <div className="activity-bar-track">
                                  <div
                                    className="activity-bar-fill"
                                    style={{ height: `${Math.max(heightPercent, 8)}%` }}
                                    title={`${item.count} bookings · ${formatCurrency(item.totalAmount)}`}
                                  />
                                </div>
                                <div className="activity-bar-label">{formatMonth(item.year, item.month)}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <FaRegClock className="fs-1 text-muted mb-3" />
                        <h5 className="fw-semibold mb-2">No rental activity available yet</h5>
                        <p className="text-muted mb-0">Your booking activity will appear here once you have rentals.</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* 4. Spending Summary */}
              <section className="mb-4">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div className="section-title-icon-wrap">
                        <FaCoins />
                      </div>
                      <div>
                        <h3 className="home-section-title mb-1">Spending Summary</h3>
                        <p className="home-section-subtitle mb-0">Your rental expenditure breakdown</p>
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-12 col-md-6 col-lg-3">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Total Amount Spent</div>
                          <div className="fw-bold fs-5 text-primary mt-1">
                            {formatCurrency(stats?.spending?.totalSpent)}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-lg-3">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Average Rental Value</div>
                          <div className="fw-bold fs-5 text-info mt-1">
                            {formatCurrency(stats?.spending?.averageRentalValue)}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-lg-3">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Highest Rental Amount</div>
                          <div className="fw-bold fs-5 text-success mt-1">
                            {formatCurrency(stats?.spending?.highestRentalAmount)}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-lg-3">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Completed Rental Value</div>
                          <div className="fw-bold fs-5 text-dark mt-1">
                            {formatCurrency(stats?.spending?.totalCompletedRentalValue)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 6. Recent Rental Activity */}
              <section className="mb-4">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center justify-content-between gap-3 mb-4 flex-wrap">
                      <div className="d-flex align-items-center gap-3">
                        <div className="section-title-icon-wrap">
                          <FaClock />
                        </div>
                        <div>
                          <h3 className="home-section-title mb-1">Recent Rental Activity</h3>
                          <p className="home-section-subtitle mb-0">Your latest bookings</p>
                        </div>
                      </div>
                      <Link className="view-all-link" to="/customer/bookings">
                        View all <FaEye className="ms-1 fs-6" />
                      </Link>
                    </div>

                    {stats?.recentRentals?.length ? (
                      <div className="list-group">
                        {stats.recentRentals.map((booking) => (
                          <div className="list-group-item p-3 border-0" key={booking._id}>
                            <div className="d-flex align-items-start gap-3 flex-wrap">
                              <img
                                alt={booking.equipment?.name || "Equipment"}
                                src={getImageUrl(booking.equipment?.images)}
                                className="rounded-3"
                                style={{ width: "64px", height: "64px", objectFit: "cover" }}
                                onError={(e) => {
                                  e.currentTarget.src = placeholderImage;
                                }}
                              />
                              <div className="flex-grow-1 min-w-0">
                                <strong className="d-block text-truncate text-dark">
                                  {booking.equipment?.name || "Equipment"}
                                </strong>
                                <div className="home-section-subtitle mt-1 small">
                                  {booking.bookingNumber || booking._id} · {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                                </div>
                                <div className="home-section-subtitle mt-1 small">
                                  {booking.equipment?.category || "—"}
                                </div>
                              </div>
                              <div className="text-end">
                                <span className={`badge bg-${STATUS_COLORS[booking.status] || "secondary"}-subtle text-${STATUS_COLORS[booking.status] || "secondary"}`}>
                                  {booking.status}
                                </span>
                                <div className="fw-bold text-dark mt-2">{formatCurrency(booking.totalAmount)}</div>
                                <Link
                                  className="btn btn-outline-primary btn-sm mt-2"
                                  to="/customer/bookings"
                                >
                                  <FaEye className="me-1" />
                                  View Booking
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <FaRegClock className="fs-1 text-muted mb-3" />
                        <h5 className="fw-semibold mb-2">No recent rentals</h5>
                        <p className="text-muted mb-0">Your recent bookings will appear here.</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="col-12 col-xl-4">
              {/* 3. Booking Status Distribution */}
              <section className="mb-4">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div className="section-title-icon-wrap">
                        <FaChartPie />
                      </div>
                      <div>
                        <h3 className="home-section-title mb-1">Booking Status</h3>
                        <p className="home-section-subtitle mb-0">Distribution by status</p>
                      </div>
                    </div>

                    {totalForDistribution > 0 ? (
                      <div className="status-distribution">
                        {STATUS_ORDER.map((status) => {
                          const count = statusDistributionMap[status] || 0;
                          const percent = totalForDistribution > 0 ? (count / totalForDistribution) * 100 : 0;
                          return (
                            <div className="status-distribution-item" key={status}>
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="fw-semibold">{status}</span>
                                <span className="text-muted small">
                                  {count} ({percent.toFixed(0)}%)
                                </span>
                              </div>
                              <div className="status-bar-track">
                                <div
                                  className={`status-bar-fill is-${STATUS_COLORS[status] || "secondary"}`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <FaRegClock className="fs-1 text-muted mb-3" />
                        <p className="text-muted mb-0">No booking data available.</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* 7. Rental Insights */}
              <section className="mb-4">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div className="section-title-icon-wrap">
                        <FaArrowTrendUp />
                      </div>
                      <div>
                        <h3 className="home-section-title mb-1">Rental Insights</h3>
                        <p className="home-section-subtitle mb-0">Derived from your activity</p>
                      </div>
                    </div>

                    <div className="insights-list">
                      <div className="insight-item">
                        <div className="insight-label">Most Rented Category</div>
                        <div className="insight-value">{stats?.insights?.mostRentedCategory || "—"}</div>
                      </div>
                      <div className="insight-item">
                        <div className="insight-label">Average Rental Duration</div>
                        <div className="insight-value">
                          {stats?.insights?.averageRentalDuration || 0} day{(stats?.insights?.averageRentalDuration || 0) === 1 ? "" : "s"}
                        </div>
                      </div>
                      <div className="insight-item">
                        <div className="insight-label">Total Rental Days</div>
                        <div className="insight-value">{stats?.insights?.totalDays || 0} days</div>
                      </div>
                      <div className="insight-item">
                        <div className="insight-label">Completed Rentals</div>
                        <div className="insight-value">{stats?.insights?.completedBookings || 0}</div>
                      </div>
                      <div className="insight-item">
                        <div className="insight-label">Highest Spending Month</div>
                        <div className="insight-value">
                          {stats?.insights?.highestSpendingMonth
                            ? `${formatMonth(stats.insights.highestSpendingMonth.year, stats.insights.highestSpendingMonth.month)} · ${formatCurrency(stats.insights.highestSpendingMonth.total)}`
                            : "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* 5. Most Rented Equipment */}
          <section className="mb-4">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="section-title-icon-wrap">
                <FaBagShopping />
              </div>
              <div>
                <h2 className="home-section-title mb-1">Most Rented Equipment</h2>
                <p className="home-section-subtitle mb-0">Equipment you rent most frequently</p>
              </div>
            </div>

            {stats?.mostRentedEquipment?.length ? (
              <div className="row g-4">
                {stats.mostRentedEquipment.map((item) => (
                  <div className="col-12 col-md-6 col-xl-4" key={item.equipmentId}>
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                      <div className="card-body p-4">
                        <div className="d-flex align-items-start gap-3">
                          <img
                            alt={item.name || "Equipment"}
                            src={getImageUrl(item.images)}
                            className="rounded-3"
                            style={{ width: "80px", height: "80px", objectFit: "cover" }}
                            onError={(e) => {
                              e.currentTarget.src = placeholderImage;
                            }}
                          />
                          <div className="flex-grow-1 min-w-0">
                            <h5 className="fw-bold mb-1 text-truncate text-dark">{item.name || "Equipment"}</h5>
                            <p className="text-muted small mb-2">{item.category || "—"}</p>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="badge bg-primary-subtle text-primary">
                                {item.rentalCount} rental{item.rentalCount === 1 ? "" : "s"}
                              </span>
                              <span className="fw-bold text-dark">{formatCurrency(item.totalSpent)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
                <FaBagShopping className="fs-1 text-muted mb-3" />
                <h5 className="fw-semibold mb-2">No rental history available</h5>
                <p className="text-muted mb-0">Your most rented equipment will appear here.</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default RentalStats;