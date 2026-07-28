import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowsRotate,
  FaCircleCheck,
  FaEllipsisVertical,
  FaEye,
  FaLocationDot,
  FaPenToSquare,
  FaStar,
  FaTrash,
  FaUpload,
} from "react-icons/fa6";

const imageBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const placeholderImage = "https://via.placeholder.com/900x600?text=No+Image";

const getImageUrl = (equipment) => {
  const image = equipment?.images?.[0];
  if (!image) return placeholderImage;
  if (/^https?:\/\//i.test(image)) return image;
  return `${imageBaseUrl}/uploads/${image}`;
};

const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function OwnerEquipmentCard({ equipment, onDelete, onToggleAvailability, onUpdateImages }) {
  const [showMenu, setShowMenu] = useState(false);

  const imageSrc = getImageUrl(equipment);
  const rating = Number(equipment?.averageRating || 0);
  const availabilityText = equipment?.status || (equipment?.available ? "Available" : "Unavailable");

  const metrics = useMemo(
    () => [
      { label: "Price / day", value: `Rs. ${Number(equipment?.pricePerDay || 0).toLocaleString("en-IN")}` },
      { label: "Deposit", value: `Rs. ${Number(equipment?.deposit || 0).toLocaleString("en-IN")}` },
      { label: "Location", value: equipment?.location || "N/A", icon: FaLocationDot },
      { label: "Rating", value: `${rating.toFixed(1)} / 5`, icon: FaStar },
      { label: "Reviews", value: String(equipment?.totalReviews || 0) },
      { label: "Created", value: formatDate(equipment?.createdAt) },
    ],
    [equipment, rating]
  );

  return (
    <div className="col-12">
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="row g-0">
          <div className="col-md-4 col-lg-3">
            <div className="position-relative h-100">
              <img
                src={imageSrc}
                alt={equipment?.name || "Equipment"}
                className="img-fluid h-100 w-100"
                style={{ minHeight: "240px", objectFit: "cover" }}
              />
              <span className={`position-absolute top-0 start-0 m-3 badge ${equipment?.available ? "bg-success" : "bg-secondary"} px-3 py-2`}>
                {availabilityText}
              </span>
            </div>
          </div>

          <div className="col-md-8 col-lg-9">
            <div className="card-body p-3 p-lg-4">
              <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                <div className="min-w-0">
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                    <span className="badge bg-light text-dark">{equipment?.category || "Uncategorized"}</span>
                    {equipment?.brand ? <span className="text-muted small">{equipment.brand}</span> : null}
                  </div>
                  <h5 className="fw-bold mb-1 text-truncate">{equipment?.name || "Untitled equipment"}</h5>
                  <div className="text-muted small">Updated: {formatDate(equipment?.updatedAt)}</div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm rounded-pill"
                    onClick={() => onToggleAvailability?.(equipment)}
                  >
                    <FaCircleCheck className="me-1" />
                    Toggle Availability
                  </button>

                  <div className="dropdown">
                    <button
                      type="button"
                      className="btn btn-light btn-sm rounded-pill"
                      onClick={() => setShowMenu((prev) => !prev)}
                      aria-expanded={showMenu}
                      aria-label="Open equipment actions"
                    >
                      <FaEllipsisVertical />
                    </button>
                    {showMenu ? (
                      <div className="dropdown-menu show dropdown-menu-end p-2 shadow-sm">
                        <Link className="dropdown-item rounded-3" to={`/owner/equipment/${equipment?._id}`} onClick={() => setShowMenu(false)}>
                          <FaEye className="me-2" />
                          View details
                        </Link>
                        <Link className="dropdown-item rounded-3" to={`/owner/equipment/edit/${equipment?._id}`} onClick={() => setShowMenu(false)}>
                          <FaPenToSquare className="me-2" />
                          Edit equipment
                        </Link>
                        <button
                          type="button"
                          className="dropdown-item rounded-3"
                          onClick={() => {
                            setShowMenu(false);
                            onUpdateImages?.(equipment);
                          }}
                        >
                          <FaUpload className="me-2" />
                          Update images
                        </button>
                        <button
                          type="button"
                          className="dropdown-item text-danger rounded-3"
                          onClick={() => {
                            setShowMenu(false);
                            onDelete?.(equipment);
                          }}
                        >
                          <FaTrash className="me-2" />
                          Delete equipment
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="row g-3 mb-4">
                {metrics.map((metric) => (
                  <div className="col-6 col-xl-4" key={metric.label}>
                    <div className="border rounded-4 p-3 h-100 bg-light">
                      <div className="small text-muted d-flex align-items-center gap-1">
                        {metric.icon ? <metric.icon aria-hidden="true" /> : null}
                        {metric.label}
                      </div>
                      <div className="fw-semibold mt-1 text-truncate">{metric.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="d-flex flex-wrap gap-2">
                <Link className="btn btn-primary btn-sm rounded-pill px-3" to={`/owner/equipment/${equipment?._id}`}>
                  <FaEye className="me-1" />
                  View Details
                </Link>
                <Link className="btn btn-outline-secondary btn-sm rounded-pill px-3" to={`/owner/equipment/edit/${equipment?._id}`}>
                  <FaPenToSquare className="me-1" />
                  Edit Equipment
                </Link>
                <button
                  type="button"
                  className="btn btn-outline-dark btn-sm rounded-pill px-3"
                  onClick={() => onUpdateImages?.(equipment)}
                >
                  <FaUpload className="me-1" />
                  Update Images
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm rounded-pill px-3"
                  onClick={() => onDelete?.(equipment)}
                >
                  <FaTrash className="me-1" />
                  Delete Equipment
                </button>
                <button
                  type="button"
                  className="btn btn-outline-success btn-sm rounded-pill px-3"
                  onClick={() => onToggleAvailability?.(equipment)}
                >
                  <FaArrowsRotate className="me-1" />
                  Availability Toggle
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
