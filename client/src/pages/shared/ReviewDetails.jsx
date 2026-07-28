import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { FaCalendarDays, FaLocationDot, FaStar } from "react-icons/fa6";
import BackButton from "../../components/Common/BackButton";
import api from "../../services/api";

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const renderStars = (rating = 0) =>
  Array.from({ length: 5 }, (_, index) => (
    <FaStar key={index} className={index < Number(rating || 0) ? "text-warning" : "text-secondary opacity-25"} />
  ));

const getImageUrl = (image) => {
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  return `${API_ROOT}/uploads/${image}`;
};

function ReviewDetails() {
  const { reviewId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const equipmentId = searchParams.get("equipmentId");
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchReview = async () => {
      try {
        setLoading(true);
        setError("");

        if (!equipmentId) {
          throw new Error("Missing equipment reference.");
        }

        const response = await api.get(`/reviews/${equipmentId}`);
        if (!active) return;
        const list = response?.data?.data || [];
        const found = list.find((item) => item._id === reviewId || item.id === reviewId) || null;
        setReview(found);
        if (!found) {
          setError("Review not found.");
        }
      } catch (fetchError) {
        if (!active) return;
        setError(fetchError?.response?.data?.message || fetchError.message || "Unable to load review details.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchReview();
    return () => {
      active = false;
    };
  }, [equipmentId, reviewId]);

  const imageUrl = useMemo(() => getImageUrl(review?.equipment?.images?.[0]), [review?.equipment?.images]);
  const isOwnerPath = location.pathname.startsWith("/owner");
  const equipmentPath = review?.equipment?._id
    ? isOwnerPath
      ? `/owner/equipment/${review.equipment._id}`
      : `/customer/equipment/${review.equipment._id}`
    : "";

  return (
    <div className="container-xxl py-4">
      <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
        <BackButton label="Back" />
        <div>
          <p className="text-uppercase small fw-semibold text-primary mb-2 mb-lg-1">Review details</p>
          <h2 className="fw-bold mb-0">Customer Review</h2>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading review details...</p>
        </div>
      ) : review ? (
        <div className="row g-4">
          <div className="col-12 col-xl-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
              <img
                alt={review.equipment?.name || "Equipment"}
                className="img-fluid w-100"
                src={imageUrl || "https://via.placeholder.com/800x520?text=Equipment"}
                style={{ height: 260, objectFit: "cover" }}
              />
              <div className="card-body p-4">
                <h4 className="fw-bold mb-1">{review.equipment?.name || "Equipment"}</h4>
                <div className="text-muted mb-3">{review.equipment?.category || "Category unavailable"}</div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <FaLocationDot className="text-primary" />
                  <span>{review.equipment?.location || "Location unavailable"}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <FaCalendarDays className="text-primary" />
                  <span>{formatDateTime(review.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-8">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                  <div>
                    <div className="text-muted small">Reviewed by</div>
                    <h3 className="fw-bold mb-0">{review.customer?.name || "Customer"}</h3>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div className="review-rating d-inline-flex">{renderStars(review.rating)}</div>
                    <span className="fw-semibold">{Number(review.rating || 0).toFixed(1)}/5</span>
                  </div>
                </div>

                <div className="border rounded-4 p-4 bg-light mb-4">
                  <div className="text-uppercase small fw-semibold text-muted mb-2">Review text</div>
                  <p className="mb-0 fs-6">{review.review || "No review message provided."}</p>
                </div>

                {review.ownerReply?.trim() ? (
                  <div className="border rounded-4 p-4 mb-4">
                    <div className="text-uppercase small fw-semibold text-muted mb-2">Owner reply</div>
                    <p className="mb-2">{review.ownerReply}</p>
                    <div className="text-muted small">
                      Replied at {review.ownerRepliedAt ? formatDateTime(review.ownerRepliedAt) : "—"}
                    </div>
                  </div>
                ) : null}

                <div className="row g-3">
                  <div className="col-12 col-md-4">
                    <div className="border rounded-4 p-3 h-100">
                      <div className="text-muted small">Customer</div>
                      <div className="fw-semibold">{review.customer?.name || "—"}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="border rounded-4 p-3 h-100">
                      <div className="text-muted small">Equipment</div>
                      <div className="fw-semibold">{review.equipment?.name || "—"}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="border rounded-4 p-3 h-100">
                      <div className="text-muted small">Created</div>
                      <div className="fw-semibold">{formatDateTime(review.createdAt)}</div>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2 mt-4">
                  <Link className="btn btn-primary rounded-pill" to={equipmentPath || `/customer/equipment/${equipmentId}`}>
                    Open equipment
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ReviewDetails;
