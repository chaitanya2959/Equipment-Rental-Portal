import { useEffect, useMemo, useState } from "react";
import { FaMagnifyingGlass, FaStar, FaTrash } from "react-icons/fa6";
import api from "../../services/api";

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

const getImageUrl = (image) => {
  if (!image) return "https://via.placeholder.com/800x520?text=No+Image";
  if (/^https?:\/\//i.test(image)) return image;
  const apiRoot = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
  return `${apiRoot}/uploads/${image}`;
};

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/reviews");
      setReviews(response?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    let filtered = [...reviews];

    if (normalizedSearch) {
      filtered = filtered.filter((r) => {
        const haystack = [r.equipment?.name, r.customer?.name, r.review]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      });
    }

    return filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [reviews, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/reviews/${deleteTarget._id}`);
      setReviews((prev) => prev.filter((r) => r._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Unable to delete review.");
    } finally {
      setDeleting(false);
    }
  };

  const stats = useMemo(() => {
    const total = reviews.length;
    const avg = total > 0 ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / total).toFixed(1) : "0.0";
    const fiveStar = reviews.filter((r) => r.rating === 5).length;
    const oneStar = reviews.filter((r) => r.rating === 1).length;
    return [
      { title: "Total Reviews", value: total, subtitle: "All reviews", color: "primary" },
      { title: "Average Rating", value: avg, subtitle: "Platform avg", color: "warning" },
      { title: "5 Star", value: fiveStar, subtitle: "Excellent", color: "success" },
      { title: "1 Star", value: oneStar, subtitle: "Poor", color: "danger" },
    ];
  }, [reviews]);

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <p className="text-uppercase small fw-semibold text-primary mb-2">Admin workspace</p>
          <h2 className="fw-bold mb-1">Reviews</h2>
          <p className="text-muted mb-0">Monitor customer reviews and ratings across equipment.</p>
        </div>
        <button className="btn btn-primary" onClick={fetchReviews}>
          Refresh
        </button>
      </div>

      <div className="row g-4 mb-4">
        {stats.map((card) => (
          <div className="col-12 col-md-6 col-xl-3" key={card.title}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-1">{card.title}</h6>
                    <h3 className={`text-${card.color} fw-bold mb-0`}>{card.value}</h3>
                  </div>
                  <span className={`badge bg-${card.color}-subtle text-${card.color}`}>{card.subtitle}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-lg-4">
              <label className="form-label fw-semibold">Search</label>
              <div className="position-relative">
                <FaMagnifyingGlass className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  className="form-control ps-5"
                  placeholder="Search by equipment, customer, review..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-lg-2 text-lg-end">
              <div className="text-muted small mb-1">Results</div>
              <div className="fw-bold fs-5">{filteredReviews.length}</div>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <FaStar className="fs-1 text-muted mb-3 mx-auto" />
          <h4 className="fw-semibold mb-2">No reviews found</h4>
          <p className="text-muted mb-0">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="table-responsive card border-0 shadow-sm rounded-4 overflow-hidden">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Equipment</th>
                <th>Customer</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Created</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <tr key={review._id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {review.equipment?.images?.[0] && (
                        <img
                          src={getImageUrl(review.equipment.images[0])}
                          alt={review.equipment?.name || "Equipment"}
                          className="rounded-3"
                          style={{ width: "40px", height: "40px", objectFit: "cover" }}
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/800x520?text=No+Image";
                          }}
                        />
                      )}
                      <div className="fw-semibold small">{review.equipment?.name || "—"}</div>
                    </div>
                  </td>
                  <td>
                    <div className="fw-semibold small">{review.customer?.name || "—"}</div>
                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>{review.customer?.email || "—"}</div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-1">
                      <FaStar className="text-warning" />
                      <span className="fw-semibold">{review.rating || 0}/5</span>
                    </div>
                  </td>
                  <td>
                    <div className="small" style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {review.review || "—"}
                    </div>
                  </td>
                  <td>{formatDate(review.createdAt)}</td>
                  <td>
                    <div className="d-flex justify-content-end">
                      <button
                        className="btn btn-outline-danger btn-sm"
                        type="button"
                        onClick={() => setDeleteTarget(review)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content rounded-4 border-0">
              <div className="modal-header">
                <h5 className="modal-title">Delete Review</h5>
                <button type="button" className="btn-close" onClick={() => setDeleteTarget(null)} />
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete this review? This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" type="button" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger" type="button" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reviews;