import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BackButton from "../../components/Common/BackButton";
import {
  FaCalendarDays,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaMagnifyingGlass,
  FaPen,
  FaStar,
  FaTrash,
} from "react-icons/fa6";
import { getMyReviews, updateReview, deleteReview } from "../../services/reviewService";

const PAGE_SIZE = 6;
const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='520' viewBox='0 0 800 520'%3E%3Crect width='800' height='520' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%2394a3b8' font-family='sans-serif' font-size='24'%3ENo Image%3C/text%3E%3C/svg%3E";
const imageBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

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

const getImageUrl = (equipment) => {
  const image = equipment?.images?.[0];
  if (!image) return placeholderImage;
  if (/^https?:\/\//i.test(image)) return image;
  return `${imageBaseUrl}/uploads/${image}`;
};

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMyReviews();
      setReviews(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load your reviews.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this review?");
    if (!confirmed) return;

    try {
      await deleteReview(id);
      setReviews((current) => current.filter((r) => r._id !== id));
      setToast("Review deleted successfully.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete review.");
    }
  };

  const handleOpenEditModal = (review) => {
    setReviewToEdit(review);
    setEditRating(review.rating);
    setEditComment(review.review);
    setEditError("");
    setEditModalOpen(true);
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!editComment.trim()) {
      setEditError("Review comment is required.");
      return;
    }

    try {
      setSaving(true);
      setEditError("");
      await updateReview(reviewToEdit._id, {
        rating: editRating,
        review: editComment,
      });
      setToast("Review updated successfully.");
      setEditModalOpen(false);
      fetchReviews();
    } catch (err) {
      setEditError(err?.response?.data?.message || "Failed to update review.");
    } finally {
      setSaving(false);
    }
  };

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reviews.filter((review) => {
      const matchesSearch =
        !query ||
        review.equipment?.name?.toLowerCase().includes(query) ||
        review.review?.toLowerCase().includes(query);

      const matchesRating =
        ratingFilter === "all" || review.rating === Number(ratingFilter);

      return matchesSearch && matchesRating;
    });
  }, [reviews, search, ratingFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / PAGE_SIZE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedReviews = useMemo(() => {
    const start = (currentPageSafe - 1) * PAGE_SIZE;
    return filteredReviews.slice(start, start + PAGE_SIZE);
  }, [filteredReviews, currentPageSafe]);

  return (
    <div className="container-xxl py-4">
      {toast ? <div className="alert alert-success">{toast}</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <BackButton label="Back" />
          <div>
            <p className="text-uppercase small fw-semibold text-primary mb-2">Customer workspace</p>
            <h2 className="fw-bold mb-1">My Reviews</h2>
            <p className="text-muted mb-0">View, edit or delete reviews you have written for equipment.</p>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-3 p-lg-4">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-0">
                  <FaMagnifyingGlass className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-0"
                  placeholder="Search reviews or equipment..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            <div className="col-12 col-md-4 col-lg-3">
              <select
                className="form-select bg-light border-0"
                value={ratingFilter}
                onChange={(e) => {
                  setRatingFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            <div className="col-12 col-md text-md-end text-muted small">
              Found {filteredReviews.length} reviews
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading your reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5 px-4">
          <div className="py-4">
            <div className="fs-1 text-muted mb-3">💬</div>
            <h4 className="fw-bold mb-2">No Reviews Found</h4>
            <p className="text-muted mx-auto mb-4" style={{ maxWidth: "480px" }}>
              {search || ratingFilter !== "all"
                ? "We couldn't find any reviews matching your search filters. Try resetting them!"
                : "You haven't reviewed any equipment yet. Complete some rentals to write feedback!"}
            </p>
            {!search && ratingFilter === "all" && (
              <Link to="/customer/bookings" className="btn btn-primary">
                View My Bookings
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="row g-4">
            {paginatedReviews.map((review) => (
              <div className="col-12 col-md-6 col-lg-4" key={review._id}>
                <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden d-flex flex-column">
                  <img
                    alt={review.equipment?.name || "Equipment"}
                    className="w-100"
                    src={getImageUrl(review.equipment)}
                    style={{ height: "180px", objectFit: "cover" }}
                      onError={(event) => {
                        event.currentTarget.src = placeholderImage;
                        event.currentTarget.onerror = null;
                      }}
                  />
                  <div className="card-body p-4 d-flex flex-column flex-grow-1">
                    <div className="mb-2">
                      <h5 className="fw-bold mb-1">{review.equipment?.name || "Equipment"}</h5>
                      <span className="badge bg-light text-primary">{review.equipment?.category}</span>
                    </div>

                    <div className="d-flex align-items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          color={star <= review.rating ? "#f59e0b" : "#e2e8f0"}
                          size={16}
                        />
                      ))}
                      <span className="ms-2 small text-muted">({review.rating} / 5)</span>
                    </div>

                    <p className="text-secondary small mb-3 flex-grow-1" style={{ whiteSpace: "pre-line" }}>
                      "{review.review}"
                    </p>

                    <hr className="my-3 opacity-25" />

                    <div className="mb-3">
                      {review.booking ? (
                        <div className="border rounded-3 p-2 bg-light">
                          {typeof review.booking === "object" && review.booking.bookingNumber ? (
                            <>
                              <div className="text-muted small">Booking: {review.booking.bookingNumber}</div>
                              <div className="small fw-semibold text-secondary">
                                {formatDate(review.booking.startDate)} - {formatDate(review.booking.endDate)}
                              </div>
                            </>
                          ) : (
                            <div className="text-muted small">
                              {typeof review.booking === "string" ? `Booking: ${review.booking}` : typeof review.booking._id === "string" ? `Booking: ${review.booking._id}` : "Booking"}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-muted small">Legacy Review</div>
                      )}
                    </div>

                    {review.ownerReply ? (
                      <div className="border-start border-primary border-3 ps-3 py-1 mb-3 bg-light rounded-2">
                        <div className="fw-bold small text-primary mb-1">Owner Response:</div>
                        <p className="text-muted small mb-0">"{review.ownerReply}"</p>
                      </div>
                    ) : null}

                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <span className="text-muted small">{formatDate(review.createdAt)}</span>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-primary btn-sm rounded-pill"
                          onClick={() => handleOpenEditModal(review)}
                          title="Edit Review"
                        >
                          <FaPen className="me-1" /> Edit
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm rounded-pill"
                          onClick={() => handleDelete(review._id)}
                          title="Delete Review"
                        >
                          <FaTrash className="me-1" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <span className="text-muted small">
                Showing page {currentPageSafe} of {totalPages}
              </span>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={currentPageSafe === 1}
                  onClick={() => setCurrentPage((c) => c - 1)}
                >
                  <FaChevronLeft />
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={currentPageSafe === totalPages}
                  onClick={() => setCurrentPage((c) => c + 1)}
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {editModalOpen ? (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(15, 23, 42, 0.7)", zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <form onSubmit={handleUpdateReview}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Edit Review</h5>
                  <button type="button" className="btn-close" onClick={() => setEditModalOpen(false)} />
                </div>
                <div className="modal-body">
                  {editError ? <div className="alert alert-danger">{editError}</div> : null}
                  <div className="mb-4 text-center">
                    <p className="text-muted small mb-2">Update your rating:</p>
                    <div className="d-flex justify-content-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="btn p-1 border-0"
                          style={{ background: "none" }}
                          onClick={() => setEditRating(star)}
                        >
                          <FaStar
                            size={32}
                            color={star <= editRating ? "#f59e0b" : "#cbd5e1"}
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
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setEditModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
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

export default Reviews;
