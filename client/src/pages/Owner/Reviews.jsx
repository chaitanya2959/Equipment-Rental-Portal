import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowDownWideShort,
  FaCalendarDays,
  FaCommentDots,
  FaFilter,
  FaMagnifyingGlass,
  FaReply,
  FaRegStar,
  FaStar,
  FaTrashCan,
  FaTriangleExclamation,
} from "react-icons/fa6";
import BackButton from "../../components/Common/BackButton";
import API from "../../services/api";

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

const ratingOptions = [
  { label: "All Ratings", value: "" },
  { label: "5 Stars", value: "5" },
  { label: "4 Stars", value: "4" },
  { label: "3 Stars", value: "3" },
  { label: "2 Stars", value: "2" },
  { label: "1 Star", value: "1" },
];

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [replyingId, setReplyingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [toast, setToast] = useState("");

  async function fetchReviews() {
    try {
      setLoading(true);
      setError("");

      const equipmentRes = await API.get("/equipment/my-equipment");
      const equipmentList = equipmentRes?.data?.data || [];

      const reviewResponses = await Promise.all(
        equipmentList.map((equipment) =>
          API.get(`/reviews/${equipment._id}`)
            .then((res) => ({ equipment, reviews: res?.data?.data || [] }))
            .catch(() => ({ equipment, reviews: [] }))
        )
      );

      const flattened = reviewResponses.flatMap(({ equipment, reviews: itemReviews }) =>
        itemReviews.map((review) => ({
          ...review,
          equipment: review.equipment || {
            _id: equipment._id,
            name: equipment.name,
            category: equipment.category,
            images: equipment.images || [],
          },
        }))
      );

      setReviews(flattened);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load reviews right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        fetchReviews();
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "N/A";

  const getImageUrl = (image) => {
    if (!image) return "";
    if (/^https?:\/\//i.test(image)) return image;
    return `${API_ROOT}/uploads/${image}`;
  };

  const renderStars = (value = 0) =>
    Array.from({ length: 5 }, (_, index) =>
      index < Number(value || 0) ? (
        <FaStar key={index} className="text-warning" />
      ) : (
        <FaRegStar key={index} className="text-warning" />
      )
    );

  const stats = useMemo(() => {
    const totalReviews = reviews.length;
    const averageRating = totalReviews
      ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / totalReviews
      : 0;
    const fiveStarCount = reviews.filter((review) => Number(review.rating || 0) === 5).length;
    const pendingReplies = reviews.filter((review) => !review.ownerReply?.trim()).length;

    return {
      totalReviews,
      averageRating,
      fiveStarCount,
      pendingReplies,
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    let list = [...reviews];
    const query = search.trim().toLowerCase();

    if (query) {
      list = list.filter((review) => {
        const customerName = review.customer?.name || "";
        const equipmentName = review.equipment?.name || "";
        const message = review.review || "";
        return (
          customerName.toLowerCase().includes(query) ||
          equipmentName.toLowerCase().includes(query) ||
          message.toLowerCase().includes(query)
        );
      });
    }

    if (ratingFilter) {
      list = list.filter((review) => Number(review.rating || 0) === Number(ratingFilter));
    }

    list.sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return sortOrder === "latest" ? bTime - aTime : aTime - bTime;
    });

    return list;
  }, [reviews, search, ratingFilter, sortOrder]);

  const openReplyModal = (review) => {
    setReplyTarget(review);
    setReplyText(review.ownerReply || "");
  };

  const openDeleteModal = (review) => {
    setDeleteTarget(review);
  };

  const closeDialogs = () => {
    setReplyTarget(null);
    setReplyText("");
    setDeleteTarget(null);
  };

  const handleReplySubmit = async (event) => {
    event.preventDefault();

    if (!replyTarget) return;

    try {
      setReplyingId(replyTarget._id);
      await API.put(`/reviews/${replyTarget._id}`, {
        ownerReply: replyText.trim(),
      });

      setReviews((prev) =>
        prev.map((item) =>
          item._id === replyTarget._id
            ? {
                ...item,
                ownerReply: replyText.trim(),
                ownerRepliedAt: replyText.trim() ? new Date().toISOString() : item.ownerRepliedAt,
              }
            : item
        )
      );
      setToast("Reply saved successfully.");
      closeDialogs();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to save the owner reply.");
    } finally {
      setReplyingId("");
    }
  };

  const handleDeleteReview = async () => {
    if (!deleteTarget) return;

    try {
      setDeletingId(deleteTarget._id);
      await API.delete(`/reviews/${deleteTarget._id}`);
      setReviews((prev) => prev.filter((item) => item._id !== deleteTarget._id));
      setToast("Review deleted.");
      closeDialogs();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to delete this review.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="reviews-page">
      <div className="reviews-hero card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <div className="card-body p-4 p-lg-5">
          <div className="d-flex flex-column flex-xl-row justify-content-between align-items-start gap-4">
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-3 mb-3">
                <BackButton label="Back" />
                <div>
                  <p className="text-uppercase small fw-semibold text-primary mb-2">Owner workspace</p>
                  <h2 className="fw-bold mb-2">Reviews</h2>
                </div>
              </div>
              <p className="text-secondary mb-0">
                Track customer feedback, reply to open reviews, and keep your equipment reputation in shape.
              </p>
            </div>

            <div className="d-flex flex-wrap gap-3 w-100 w-xl-auto">
              <div className="review-hero-pill">
                <FaCommentDots />
                <div>
                  <span>Total reviews</span>
                  <strong>{stats.totalReviews}</strong>
                </div>
              </div>
              <div className="review-hero-pill">
                <FaStar />
                <div>
                  <span>Average rating</span>
                  <strong>{stats.averageRating ? stats.averageRating.toFixed(1) : "0.0"}/5</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-xl-3">
          <div className="metric-card card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="metric-icon bg-primary-subtle text-primary">
                <FaStar />
              </div>
              <div className="mt-3">
                <div className="text-muted small">Average Rating</div>
                <div className="display-6 fw-bold mb-0">{stats.averageRating ? stats.averageRating.toFixed(1) : "0.0"}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="metric-card card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="metric-icon bg-success-subtle text-success">
                <FaCommentDots />
              </div>
              <div className="mt-3">
                <div className="text-muted small">Total Reviews</div>
                <div className="display-6 fw-bold mb-0">{stats.totalReviews}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="metric-card card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="metric-icon bg-warning-subtle text-warning">
                <FaRegStar />
              </div>
              <div className="mt-3">
                <div className="text-muted small">5 Star Count</div>
                <div className="display-6 fw-bold mb-0">{stats.fiveStarCount}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="metric-card card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="metric-icon bg-danger-subtle text-danger">
                <FaReply />
              </div>
              <div className="mt-3">
                <div className="text-muted small">Pending Replies</div>
                <div className="display-6 fw-bold mb-0">{stats.pendingReplies}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="reviews-toolbar card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-3 p-lg-4">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-lg-5">
              <label className="form-label fw-semibold">Search Review</label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaMagnifyingGlass />
                </span>
                <input
                  type="search"
                  className="form-control"
                  placeholder="Search by customer, equipment, or message"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-semibold">Filter by Rating</label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaFilter />
                </span>
                <select className="form-select" value={ratingFilter} onChange={(event) => setRatingFilter(event.target.value)}>
                  {ratingOptions.map((option) => (
                    <option key={option.label} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-2">
              <label className="form-label fw-semibold">Sort by</label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaArrowDownWideShort />
                </span>
                <select className="form-select" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
            </div>

            <div className="col-12 col-lg-2 text-lg-end">
              <div className="text-muted small mb-1">Visible reviews</div>
              <div className="fw-bold fs-4">{filteredReviews.length}</div>
            </div>
          </div>
        </div>
      </div>

      {toast ? (
        <div className="alert alert-success d-flex align-items-center gap-2 shadow-sm">
          <span className="fw-semibold">{toast}</span>
        </div>
      ) : null}

      {error ? (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <FaTriangleExclamation />
          <span>{error}</span>
        </div>
      ) : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading owner reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-5 text-center">
            <FaCommentDots className="text-muted mb-3" size={42} />
            <h4 className="fw-bold mb-2">No reviews found</h4>
            <p className="text-muted mb-0">
              Try a different search, rating filter, or sort option to find the review you need.
            </p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {filteredReviews.map((review) => {
            const customerName = review.customer?.name || "Customer";
            const customerInitial = customerName.charAt(0).toUpperCase();
            const profileImage = review.customer?.profileImage ? getImageUrl(review.customer.profileImage) : "";
            const equipmentName = review.equipment?.name || "Equipment";
            const hasReply = Boolean(review.ownerReply?.trim());

            return (
              <div className="col-12 col-xl-6" key={review._id}>
                <div className="review-card card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="review-avatar">
                          {profileImage ? (
                            <img src={profileImage} alt={customerName} />
                          ) : (
                            <span>{customerInitial}</span>
                          )}
                        </div>
                        <div>
                          <h5 className="fw-bold mb-1">{customerName}</h5>
                          <div className="text-muted small mb-1">{equipmentName}</div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="review-rating">{renderStars(review.rating)}</span>
                            <span className="text-muted small">{Number(review.rating || 0).toFixed(1)}/5</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-md-end">
                        <div className="review-meta">
                          <FaCalendarDays />
                          <span>{formatDate(review.createdAt)}</span>
                        </div>
                        <span className={`review-state ${hasReply ? "is-replied" : "is-pending"}`}>
                          {hasReply ? "Replied" : "Pending reply"}
                        </span>
                      </div>
                    </div>

                    <div className="review-message border rounded-4 p-3 mb-3 bg-light">
                      <p className="mb-0 text-secondary">{review.review || "No review message provided."}</p>
                    </div>

                    {hasReply ? (
                      <div className="reply-box border rounded-4 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong className="text-primary">Owner reply</strong>
                          <small className="text-muted">
                            {review.ownerRepliedAt ? formatDate(review.ownerRepliedAt) : "Saved reply"}
                          </small>
                        </div>
                        <p className="mb-0 text-secondary">{review.ownerReply}</p>
                      </div>
                    ) : null}

                    <div className="d-flex flex-column flex-sm-row gap-2">
                      <button className="btn btn-primary flex-fill" onClick={() => openReplyModal(review)} type="button">
                        <FaReply className="me-2" />
                        {hasReply ? "Edit Reply" : "Owner Reply"}
                      </button>
                      <Link
                        className="btn btn-outline-primary flex-fill"
                        to={`/owner/reviews/${review._id}?equipmentId=${review.equipment?._id}`}
                      >
                        View Details
                      </Link>
                      <button className="btn btn-outline-danger flex-fill" onClick={() => openDeleteModal(review)} type="button">
                        <FaTrashCan className="me-2" />
                        Delete Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {replyTarget ? (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content rounded-4 border-0">
              <form onSubmit={handleReplySubmit}>
                <div className="modal-header">
                  <div>
                    <h5 className="modal-title mb-1">Owner Reply</h5>
                    <div className="text-muted small">
                      {replyTarget.customer?.name || "Customer"} about {replyTarget.equipment?.name || "equipment"}
                    </div>
                  </div>
                  <button type="button" className="btn-close" onClick={closeDialogs} />
                </div>
                <div className="modal-body">
                  <label className="form-label fw-semibold">Reply message</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Write a helpful reply to the customer..."
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                  />
                </div>
                <div className="modal-footer">
                  <button className="btn btn-outline-secondary" type="button" onClick={closeDialogs}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" type="submit" disabled={replyingId === replyTarget._id}>
                    {replyingId === replyTarget._id ? "Saving..." : "Save Reply"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content rounded-4 border-0">
              <div className="modal-header">
                <h5 className="modal-title">Delete Review</h5>
                <button type="button" className="btn-close" onClick={closeDialogs} />
              </div>
              <div className="modal-body">
                <p className="mb-0">
                  Delete the review from <strong>{deleteTarget.customer?.name || "this customer"}</strong> for{" "}
                  <strong>{deleteTarget.equipment?.name || "this equipment"}</strong>?
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" type="button" onClick={closeDialogs}>
                  Cancel
                </button>
                <button className="btn btn-danger" type="button" onClick={handleDeleteReview} disabled={deletingId === deleteTarget._id}>
                  {deletingId === deleteTarget._id ? "Deleting..." : "Delete Review"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Reviews;
