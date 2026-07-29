import { Link } from "react-router-dom";
import { FaCircleCheck, FaEye, FaHeart, FaLocationDot, FaRegStar } from "react-icons/fa6";
import "../../assets/styles/cards.css";

const imageBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const placeholderImage = "https://via.placeholder.com/800x520?text=No+Image";

const getImageUrl = (equipment) => {
  const image = equipment?.images?.[0];
  if (!image) return placeholderImage;
  if (/^https?:\/\//i.test(image)) return image;
  return `${imageBaseUrl}/uploads/${image}`;
};

function EquipmentCard({ equipment, detailsUrl, bookUrl, onAddToWishlist, variant = "grid" }) {
  const imageSrc = getImageUrl(equipment);
  const availabilityLabel = equipment.status || (equipment.available ? "Available" : "Unavailable");
  const reviewCount = Number(equipment.totalReviews || 0);
  const rating = Number(equipment.averageRating ?? equipment.rating ?? 0).toFixed(1);
  const compact = variant === "compact";

  const card = (
    <div className={`equipment-card card border-0 h-100 overflow-hidden ${compact ? "is-compact" : ""}`}>
      <div className="equipment-card-image-wrap">
        <img src={imageSrc} className="equipment-card-image" alt={equipment.name} />
        <span
          className={`equipment-card-status ${
            equipment.available || equipment.status === "Available" ? "is-available" : "is-unavailable"
          }`}
        >
          {availabilityLabel}
        </span>
        <button
          type="button"
          className="equipment-wishlist-button"
          onClick={() => onAddToWishlist?.(equipment)}
          aria-label="Add to wishlist"
        >
          <FaHeart />
        </button>
      </div>

      <div className="card-body d-flex flex-column p-4">
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
          <div className="min-w-0 flex-grow-1">
            <span className="equipment-card-badge mb-2">{equipment.category || equipment.brand || "Uncategorized"}</span>
            <h5 className="equipment-card-title mb-1">{equipment.name}</h5>
            <p className="text-muted mb-0 text-truncate">
              {equipment.brand || "Brand unavailable"} · {equipment.location || "Location unavailable"}
            </p>
          </div>
          <span className="equipment-price-badge">{formatCurrency(equipment.pricePerDay)}/day</span>
        </div>

        <div className="equipment-card-meta">
          <div className="equipment-meta-row">
            <span>Brand</span>
            <strong>{equipment.brand || "Not specified"}</strong>
          </div>
          <div className="equipment-meta-row">
            <span className="d-inline-flex align-items-center gap-1">
              <FaLocationDot className="text-primary" />
              Location
            </span>
            <strong className="text-truncate">{equipment.location || "Not specified"}</strong>
          </div>
          <div className="equipment-meta-row">
            <span>Deposit</span>
            <strong>{formatCurrency(equipment.deposit || 0)}</strong>
          </div>
          <div className="equipment-meta-row">
            <span>Rating</span>
            <strong className="d-flex align-items-center gap-1">
              <FaRegStar className="text-warning" />
              {rating}/5
            </strong>
          </div>
          <div className="equipment-meta-row">
            <span>Reviews</span>
            <strong className="d-inline-flex align-items-center gap-1">
              <FaCircleCheck className="text-success" />
              {reviewCount}
            </strong>
          </div>
          {equipment.owner?.name ? (
            <div className="equipment-meta-row">
              <span>Owner</span>
              <strong>{equipment.owner.name}</strong>
            </div>
          ) : null}
        </div>

        <div className="mt-auto d-grid gap-2">
          <Link className="btn btn-primary btn-sm rounded-pill" to={detailsUrl || `/customer/equipment/${equipment._id || equipment.id}`}>
            <FaEye /> View Details
          </Link>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm rounded-pill"
            onClick={() => onAddToWishlist?.(equipment)}
          >
            <FaHeart /> Add to Wishlist
          </button>
          <Link
            className="btn btn-light btn-sm rounded-pill"
            to={bookUrl || detailsUrl || `/customer/equipment/${equipment._id || equipment.id}`}
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );

  if (compact) {
    return card;
  }

  return <div className="col-12 col-md-6 col-xl-3">{card}</div>;
}

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(value || 0);

export default EquipmentCard;

