import { FaCalendarDays, FaEdit, FaEye, FaStar, FaTrash, FaLocationDot } from "react-icons/fa6";
import { Link } from "react-router-dom";

const imageBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const placeholderImage = "https://via.placeholder.com/800x520?text=No+Image";

const getImageUrl = (equipment) => {
  const image = equipment?.images?.[0];
  if (!image) return placeholderImage;
  if (/^https?:\/\//i.test(image)) return image;
  return `${imageBaseUrl}/uploads/${image}`;
};

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function OwnerEquipmentCard({ equipment, onBookingsClick, onDelete }) {
  const imageSrc = getImageUrl(equipment);
  const availabilityLabel = equipment.status || (equipment.available ? "Available" : "Unavailable");
  const rating = equipment.averageRating || 0;

  return (
    <div className="col-12">
      <div className="card border-0 shadow-sm rounded-4 mb-3">
        <div className="row g-0">
          <div className="col-md-3 col-lg-2">
            <img
              src={imageSrc}
              alt={equipment.name}
              className="img-fluid rounded-start-4 h-100"
              style={{ height: "200px", objectFit: "cover", width: "100%" }}
            />
          </div>
          <div className="col-md-9 col-lg-10">
            <div className="card-body p-3 p-md-4">
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                <div className="min-w-0">
                  <h5 className="fw-bold mb-1 text-truncate">{equipment.name}</h5>
                  <div className="d-flex flex-wrap gap-2 small text-muted">
                    <span className="badge bg-light text-dark">{equipment.category}</span>
                    {equipment.brand ? <span>{equipment.brand}</span> : null}
                  </div>
                </div>
                <span className={`badge ${equipment.available ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"} px-3 py-2`}>
                  {availabilityLabel}
                </span>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6 col-md-3">
                  <div className="border rounded-3 p-2 h-100">
                    <div className="small text-muted">Price / Day</div>
                    <div className="fw-semibold">₹{equipment.pricePerDay || 0}</div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="border rounded-3 p-2 h-100">
                    <div className="small text-muted">Deposit</div>
                    <div className="fw-semibold">₹{equipment.deposit || 0}</div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="border rounded-3 p-2 h-100">
                    <div className="small text-muted">Rating</div>
                    <div className="fw-semibold d-flex align-items-center gap-1">
                      <FaStar className="text-warning" /> {rating.toFixed(1)}
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="border rounded-3 p-2 h-100">
                    <div className="small text-muted">Reviews</div>
                    <div className="fw-semibold">{equipment.totalReviews || 0}</div>
                  </div>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2 small text-muted mb-3">
                {equipment.location ? (
                  <span className="d-flex align-items-center gap-1">
                    <FaLocationDot className="text-primary" /> {equipment.location}
                  </span>
                ) : null}
                <span>Created: {formatDate(equipment.createdAt)}</span>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <Link className="btn btn-outline-primary btn-sm rounded-pill" to={`/owner/equipment/${equipment._id}`}>
                  <FaEye className="me-1" /> View Details
                </Link>
                <Link className="btn btn-outline-secondary btn-sm rounded-pill" to={`/owner/equipment/${equipment._id}/edit`}>
                  <FaEdit className="me-1" /> Edit
                </Link>
                <button
                  type="button"
                  className="btn btn-outline-dark btn-sm rounded-pill"
                  onClick={() => onBookingsClick?.(equipment)}
                >
                  <FaCalendarDays className="me-1" /> Booking Requests
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm rounded-pill"
                  onClick={() => onDelete?.(equipment)}
                >
                  <FaTrash className="me-1" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerEquipmentCard;