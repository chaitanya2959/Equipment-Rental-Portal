import { useEffect, useMemo, useState } from "react";
import BackButton from "../../components/Common/BackButton";
import {
  FaCalendarDays,
  FaChevronLeft,
  FaChevronRight,
  FaCircleXmark,
  FaEye,
  FaMagnifyingGlass,
  FaRegClock,
  FaStar,
} from "react-icons/fa6";
import { cancelBooking, getMyBookings } from "../../services/bookingService";
import { getMyReviews, createReview, updateReview } from "../../services/reviewService";

const PAGE_SIZE = 6;

const statusClasses = {
  Pending: "bg-warning-subtle text-warning",
  Approved: "bg-success-subtle text-success",
  PickedUp: "bg-info-subtle text-info",
  Completed: "bg-primary-subtle text-primary",
  Rejected: "bg-danger-subtle text-danger",
  Cancelled: "bg-secondary-subtle text-secondary",
};

const paymentClasses = {
  Pending: "bg-warning-subtle text-warning",
  Paid: "bg-success-subtle text-success",
  Failed: "bg-danger-subtle text-danger",
  Refunded: "bg-secondary-subtle text-secondary",
};

const imageBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const placeholderImage = "https://via.placeholder.com/800x520?text=No+Image";

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

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const getDaysDiff = (from, to) => {
  const start = new Date(from);
  const end = new Date(to);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

const getRentalState = (booking) => {
  const startDate = booking.startDate ? new Date(booking.startDate) : null;
  const endDate = booking.endDate ? new Date(booking.endDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (booking.status === "Completed") {
    return { label: "Completed", tone: "success", detail: "Rental closed" };
  }

  if (["Cancelled", "Rejected"].includes(booking.status)) {
    return { label: booking.status, tone: "secondary", detail: "No longer active" };
  }

  if (!startDate || !endDate) {
    return { label: booking.status || "Pending", tone: "primary", detail: "Awaiting schedule" };
  }

  const pickupDiff = getDaysDiff(today, startDate);
  const returnDiff = getDaysDiff(today, endDate);

  if (startDate > today) {
    const hoursRemaining = Math.ceil((startDate - new Date()) / (1000 * 60 * 60));
    if (hoursRemaining <= 24) {
      return { label: "Pickup within 24h", tone: "warning", detail: `${hoursRemaining} hour${hoursRemaining === 1 ? "" : "s"} left` };
    }
    return { label: "Upcoming", tone: "info", detail: `Pickup in ${pickupDiff} day${pickupDiff === 1 ? "" : "s"}` };
  }

  if (booking.status === "PickedUp" || booking.status === "Approved") {
    if (returnDiff < 0) {
      return { label: "Overdue", tone: "danger", detail: `${Math.abs(returnDiff)} day${Math.abs(returnDiff) === 1 ? "" : "s"} overdue` };
    }
    if (returnDiff === 0) {
      return { label: "Due today", tone: "warning", detail: "Return today" };
    }
    return { label: "Active", tone: "success", detail: `${returnDiff} day${returnDiff === 1 ? "" : "s"} remaining` };
  }

  if (returnDiff < 0) {
    return { label: "Overdue", tone: "danger", detail: `${Math.abs(returnDiff)} day${Math.abs(returnDiff) === 1 ? "" : "s"} overdue` };
  }

  return { label: booking.status || "Pending", tone: "info", detail: "In progress" };
};

const getImageUrl = (equipment) => {
  const image = equipment?.images?.[0];
  if (!image) return placeholderImage;
  if (/^https?:\/\//i.test(image)) return image;
  return `${imageBaseUrl}/uploads/${image}`;
};


function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [toast, setToast] = useState("");

  const [reviews, setReviews] = useState([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const [bookingsData, reviewsData] = await Promise.all([
        getMyBookings(),
        getMyReviews()
      ]);
      setBookings(bookingsData);
      setReviews(reviewsData);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Unable to load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadBookings = async () => {
      try {
        setLoading(true);
        setError("");
        const [bookingsData, reviewsData] = await Promise.all([
          getMyBookings(),
          getMyReviews()
        ]);
        if (!active) return;
        setBookings(bookingsData);
        setReviews(reviewsData);
      } catch (fetchError) {
        if (!active) return;
        setError(fetchError?.response?.data?.message || "Unable to load your bookings.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadBookings();
    return () => {
      active = false;
    };
  }, []);

  const handleOpenReviewModal = (existingReview = null) => {
    if (existingReview) {
      setReviewToEdit(existingReview);
      setReviewRating(existingReview.rating);
      setReviewComment(existingReview.review);
    } else {
      setReviewToEdit(null);
      setReviewRating(5);
      setReviewComment("");
    }
    setReviewError("");
    setReviewModalOpen(true);
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      setReviewError("Review comment is required.");
      return;
    }
    try {
      setSubmittingReview(true);
      setReviewError("");
      if (reviewToEdit) {
        await updateReview(reviewToEdit._id, {
          rating: reviewRating,
          review: reviewComment,
        });
        setToast("Review updated successfully.");
      } else {
        await createReview({
          equipment: selectedBooking.equipment._id,
          booking: selectedBooking._id,
          rating: reviewRating,
          review: reviewComment,
        });
        setToast("Review submitted successfully.");
      }
      const updatedReviews = await getMyReviews();
      setReviews(updatedReviews);
      setReviewModalOpen(false);
    } catch (err) {
      setReviewError(err?.response?.data?.message || "Failed to save review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    const items = bookings.filter((booking) => {
      const haystack = [
        booking.bookingNumber,
        booking.equipment?.name,
        booking.equipment?.brand,
        booking.equipment?.location,
        booking.status,
        booking.paymentStatus,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return !query || haystack.includes(query);
    });

    items.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortBy === "oldest" ? dateA - dateB : dateB - dateA;
    });

    return items.map((booking) => ({ ...booking, rentalState: getRentalState(booking) }));
  }, [bookings, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedBookings = useMemo(() => {
    const start = (currentPageSafe - 1) * PAGE_SIZE;
    return filteredBookings.slice(start, start + PAGE_SIZE);
  }, [filteredBookings, currentPageSafe]);

  const handleCancel = async (booking) => {
    const confirmed = window.confirm(`Cancel booking ${booking.bookingNumber || booking._id}?`);
    if (!confirmed) return;

    try {
      setCancelling(booking._id);
      await cancelBooking(booking._id);
      setBookings((current) => current.filter((item) => item._id !== booking._id));
      setSelectedBooking((current) => (current?._id === booking._id ? null : current));
      setToast("Booking cancelled successfully.");
    } catch (cancelError) {
      setError(cancelError?.response?.data?.message || "Unable to cancel booking.");
    } finally {
      setCancelling(null);
    }
  };

  const stats = useMemo(() => {
    const active = bookings.filter((item) => ["Pending", "Approved", "PickedUp"].includes(item.status)).length;
    const completed = bookings.filter((item) => item.status === "Completed").length;
    const cancelled = bookings.filter((item) => ["Cancelled", "Rejected"].includes(item.status)).length;
    const totalAmount = bookings.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);

    return [
      { title: "Total Bookings", value: bookings.length, subtitle: "Live records", color: "primary" },
      { title: "Active", value: active, subtitle: "Pending or ongoing", color: "info" },
      { title: "Completed", value: completed, subtitle: "Finished rentals", color: "success" },
      { title: "Cancelled", value: cancelled, subtitle: "Rejected or cancelled", color: "danger" },
      { title: "Total Value", value: formatCurrency(totalAmount), subtitle: "Across all bookings", color: "dark" },
    ];
  }, [bookings]);

  const pickupReminders = useMemo(
    () =>
      bookings.filter((booking) => {
        if (booking.status !== "Approved") return false;
        const diff = getDaysDiff(new Date(), booking.startDate);
        return diff !== null && diff <= 1 && diff >= 0;
      }),
    [bookings],
  );

  const returnReminders = useMemo(
    () =>
      bookings.filter((booking) => {
        if (booking.status !== "PickedUp") return false;
        const diff = getDaysDiff(new Date(), booking.endDate);
        return diff === 1;
      }),
    [bookings],
  );

  return (
    <div className="container-xxl py-4">
      {toast ? <div className="alert alert-success">{toast}</div> : null}

      <div className="bookings-header mb-4">
        <div className="row align-items-center g-3">
          <div className="col-12 col-lg-auto">
            <BackButton label="Back" />
          </div>
          <div className="col-12 col-lg">
            <div className="bookings-title-block">
              <p className="bookings-label text-uppercase small fw-semibold text-primary mb-2">Customer workspace</p>
              <h2 className="bookings-title fw-bold mb-1">My Bookings</h2>
              <p className="bookings-subtitle text-muted mb-0">Track and manage all your rentals</p>
            </div>
          </div>
          <div className="col-12 col-lg-auto">
            <span className="bookings-count-badge">
              <FaCalendarDays className="me-1" />
              {bookings.length} Total
            </span>
          </div>
        </div>
      </div>

      {pickupReminders.length > 0 || returnReminders.length > 0 ? (
        <div className="row g-3 mb-4">
          {pickupReminders.length > 0 ? (
            <div className="col-12 col-lg-6">
              <div className="alert alert-warning rounded-4 mb-0">
                {pickupReminders.length} pickup reminder{pickupReminders.length === 1 ? "" : "s"} within 24 hours.
              </div>
            </div>
          ) : null}
          {returnReminders.length > 0 ? (
            <div className="col-12 col-lg-6">
              <div className="alert alert-info rounded-4 mb-0">
                {returnReminders.length} return reminder{returnReminders.length === 1 ? "" : "s"} due tomorrow.
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-lg-6">
              <label className="form-label fw-semibold">Search bookings</label>
              <div className="position-relative">
                <FaMagnifyingGlass className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  className="form-control ps-5"
                  placeholder="Search booking number, equipment, brand, location"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-semibold">Sort by</label>
              <select
                className="form-select"
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            <div className="col-12 col-md-6 col-lg-3 d-grid">
              <button className="btn btn-outline-secondary" type="button" onClick={fetchBookings}>
                Refresh bookings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {stats.map((card) => (
          <div className="col-12 col-md-6 col-xl-4" key={card.title}>
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4 d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-2">{card.title}</h6>
                  <h3 className={`text-${card.color} fw-bold mb-0`}>{card.value}</h3>
                </div>
                <span className={`badge bg-${card.color}-subtle text-${card.color}`}>{card.subtitle}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading your bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <FaRegClock className="fs-1 text-muted mx-auto mb-3" />
          <h4 className="fw-semibold mb-2">No bookings found</h4>
          <p className="text-muted mb-0">Try a different search or book equipment from the catalog.</p>
        </div>
      ) : (
        <>
          <div className="bookings-list">
            {paginatedBookings.map((booking) => {
              const rentalState = getRentalState(booking);
              return (
                <div className="booking-card" key={booking._id}>
                  <div className="booking-card-inner">
                    <div className="booking-card-image">
                      <img
                        alt={booking.equipment?.name || "Equipment"}
                        src={getImageUrl(booking.equipment)}
                        onError={(e) => { e.currentTarget.src = placeholderImage; }}
                      />
                    </div>
                    
                    <div className="booking-card-body">
                      <div className="booking-card-main">
                        <div className="booking-card-info">
                          <div className="booking-card-id">{booking.bookingNumber || booking._id}</div>
                          <h5 className="booking-card-equipment">{booking.equipment?.name || "Equipment"}</h5>
                          <div className="booking-card-brand">{booking.equipment?.brand || "Brand unavailable"} · {booking.equipment?.category || "—"}</div>
                        </div>
                      </div>

                      <div className="booking-card-details">
                        <div className="booking-detail-item">
                          <div className="booking-detail-label">Location</div>
                          <div className="booking-detail-value">{booking.equipment?.location || "—"}</div>
                        </div>
                        <div className="booking-detail-item">
                          <div className="booking-detail-label">Rental Period</div>
                          <div className="booking-detail-value">
                            {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                          </div>
                          <div className="booking-detail-sub">{booking.totalDays || 0} Days</div>
                        </div>
                        <div className="booking-detail-item">
                          <div className="booking-detail-label">Amount</div>
                          <div className="booking-detail-value booking-amount">{formatCurrency(booking.totalAmount)}</div>
                        </div>
                      </div>

                      <div className="booking-card-footer">
                        <div className="booking-badges">
                          <span className={`booking-badge booking-badge-${booking.status?.toLowerCase() || 'pending'}`}>
                            {booking.status || "Pending"}
                          </span>
                          <span className={`booking-badge booking-badge-${booking.paymentStatus?.toLowerCase() || 'pending'}`}>
                            {booking.paymentStatus || "Pending"}
                          </span>
                          <span className={`booking-badge booking-badge-${rentalState.tone}`}>
                            {rentalState.label}
                            <small>{rentalState.detail}</small>
                          </span>
                        </div>
                        <button 
                          className="btn btn-outline-primary btn-sm booking-view-btn"
                          type="button" 
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <FaEye className="me-1" />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mt-4">
            <div className="text-muted">
              Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredBookings.length)}-
              {Math.min(currentPage * PAGE_SIZE, filteredBookings.length)} of {filteredBookings.length}
            </div>
            <nav aria-label="Booking pagination">
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
                    <FaChevronLeft />
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <li key={page} className={`page-item ${page === currentPage ? "active" : ""}`}>
                    <button className="page-link" type="button" onClick={() => setCurrentPage(page)}>
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>
                    <FaChevronRight />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </>
      )}

      {selectedBooking ? (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(15, 23, 42, 0.55)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content rounded-4 border-0">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title mb-1">Booking Details</h5>
                  <div className="text-muted small">{selectedBooking.bookingNumber || selectedBooking._id}</div>
                </div>
                <button type="button" className="btn-close" onClick={() => setSelectedBooking(null)} />
              </div>

              <div className="modal-body">
                <div className="row g-4">
                  <div className="col-12 col-md-5">
                    <img
                      alt={selectedBooking.equipment?.name || "Equipment"}
                      className="img-fluid rounded-4 w-100"
                      src={getImageUrl(selectedBooking.equipment)}
                      style={{ height: "250px", objectFit: "cover" }}
                      onError={(event) => {
                        event.currentTarget.src = placeholderImage;
                      }}
                    />
                  </div>
                  <div className="col-12 col-md-7">
                    <div className="row g-3">
                      <div className="col-12">
                        <div className="border rounded-4 p-3">
                          <div className="text-muted small">Equipment</div>
                          <div className="fw-semibold">{selectedBooking.equipment?.name || "—"}</div>
                          <div className="text-muted small">
                            {selectedBooking.equipment?.brand || "—"} · {selectedBooking.equipment?.category || "—"}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Location</div>
                          <div className="fw-semibold">{selectedBooking.equipment?.location || "—"}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Rental Period</div>
                          <div className="fw-semibold">{formatDate(selectedBooking.startDate)}</div>
                          <div className="text-muted small">to {formatDate(selectedBooking.endDate)}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Countdown</div>
                          <div className="fw-semibold">{selectedBooking.rentalState?.label || "Pending"}</div>
                          <div className="text-muted small">{selectedBooking.rentalState?.detail || "Awaiting schedule"}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-4">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Days</div>
                          <div className="fw-semibold">{selectedBooking.totalDays || 0}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-4">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Amount</div>
                          <div className="fw-semibold">{formatCurrency(selectedBooking.totalAmount)}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-4">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Deposit</div>
                          <div className="fw-semibold">{formatCurrency(selectedBooking.depositAmount)}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Booking Status</div>
                          <div className="fw-semibold">{selectedBooking.status || "Pending"}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Payment Status</div>
                          <div className="fw-semibold">{selectedBooking.paymentStatus || "Pending"}</div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Created At</div>
                          <div className="fw-semibold">{formatDate(selectedBooking.createdAt)}</div>
                        </div>
                      </div>
                      {selectedBooking.remarks ? (
                        <div className="col-12">
                          <div className="border rounded-4 p-3 h-100">
                            <div className="text-muted small">Remarks</div>
                            <div className="fw-semibold">{selectedBooking.remarks}</div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline-secondary" type="button" onClick={() => setSelectedBooking(null)}>
                  Close
                </button>
                {["Pending", "Approved"].includes(selectedBooking.status) ? (
                  <button className="btn btn-danger" type="button" onClick={() => handleCancel(selectedBooking)} disabled={cancelling === selectedBooking._id}>
                    {cancelling === selectedBooking._id ? "Cancelling..." : "Cancel Booking"}
                  </button>
                ) : null}
                {selectedBooking.status === "Completed" && (
                  <>
                    {reviews.find(r => r.booking?._id === selectedBooking._id || r.booking === selectedBooking._id) ? (
                      <button
                        className="btn btn-outline-primary"
                        type="button"
                        onClick={() => {
                          const existingReview = reviews.find(r => r.booking?._id === selectedBooking._id || r.booking === selectedBooking._id);
                          handleOpenReviewModal(existingReview);
                        }}
                      >
                        Edit Review
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => handleOpenReviewModal()}
                      >
                        Write Review
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {reviewModalOpen ? (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(15, 23, 42, 0.7)", zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <form onSubmit={handleSaveReview}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">{reviewToEdit ? "Edit Review" : "Write a Review"}</h5>
                  <button type="button" className="btn-close" onClick={() => setReviewModalOpen(false)} />
                </div>
                <div className="modal-body">
                  {reviewError ? <div className="alert alert-danger">{reviewError}</div> : null}
                  <div className="mb-4 text-center">
                    <p className="text-muted small mb-2">How would you rate this equipment?</p>
                    <div className="d-flex justify-content-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="btn p-1 border-0"
                          style={{ background: "none" }}
                          onClick={() => setReviewRating(star)}
                        >
                          <FaStar
                            size={32}
                            color={star <= reviewRating ? "#f59e0b" : "#cbd5e1"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Your Review</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Share your experience using this equipment..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setReviewModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                    {submittingReview ? "Saving..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Bookings;