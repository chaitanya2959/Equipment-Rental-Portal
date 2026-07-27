import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../../services/api";

const imageBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const placeholderImage = "https://via.placeholder.com/900x600?text=No+Image";

const getImageUrl = (image) => {
  if (!image) return placeholderImage;
  if (/^https?:\/\//i.test(image)) return image;
  return `${imageBaseUrl}/uploads/${image}`;
};

function EquipmentDetails() {
  const { id } = useParams();
  const [equipment, setEquipment] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const [equipmentRes, reviewsRes, allEquipmentRes] = await Promise.all([
        API.get(`/equipment/${id}`),
        API.get(`/reviews/${id}`),
        API.get("/equipment"),
      ]);

      const equipmentData = equipmentRes?.data?.data;
      const reviewData = reviewsRes?.data?.data || [];
      const allEquipment = allEquipmentRes?.data?.data || [];

      setEquipment(equipmentData);
      setReviews(reviewData);
      setSimilar(
        allEquipment
          .filter((item) => item._id !== equipmentData?._id && item.category === equipmentData?.category)
          .slice(0, 4)
      );
    } catch (err) {
      console.error(err);
      setError("Unable to load equipment details right now.");
    } finally {
      setLoading(false);
    }
  };

  const imageList = useMemo(() => {
    if (!equipment?.images?.length) {
      return [placeholderImage];
    }

    return equipment.images.map((image) => getImageUrl(image));
  }, [equipment]);

  const renderStars = (value = 0) =>
    Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < Math.round(value) ? "text-warning" : "text-muted"}>
        ★
      </span>
    ));

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3 text-muted">Loading equipment details...</p>
      </div>
    );
  }

  if (error || !equipment) {
    return <div className="alert alert-danger">{error || "Equipment not found."}</div>;
  }

  return (
    <div className="container-fluid px-0">
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <img src={imageList[selectedImage]} alt={equipment.name} className="img-fluid w-100" style={{ height: "520px", objectFit: "cover" }} />
            <div className="card-body">
              <div className="row g-3">
                {imageList.map((image, index) => (
                  <div className="col-3" key={`${image}-${index}`}>
                    <img
                      src={image}
                      alt={`${equipment.name} ${index + 1}`}
                      className={`img-fluid rounded-3 border ${selectedImage === index ? "border-primary border-3" : "border-light"}`}
                      style={{ height: "110px", objectFit: "cover", width: "100%", cursor: "pointer" }}
                      onClick={() => setSelectedImage(index)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4 p-lg-5">
              <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                <div>
                  <p className="text-uppercase small fw-semibold text-primary mb-2">Featured equipment</p>
                  <h2 className="fw-bold mb-1">{equipment.name}</h2>
                  <p className="text-muted mb-0">{equipment.category}</p>
                </div>
                <span className={`badge ${equipment.available ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"} px-3 py-2`}>
                  {equipment.available ? "Available" : "Unavailable"}
                </span>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-6">
                  <div className="border rounded-3 p-3 h-100">
                    <div className="small text-muted">Price / day</div>
                    <div className="fw-bold fs-4">₹{equipment.pricePerDay}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded-3 p-3 h-100">
                    <div className="small text-muted">Deposit</div>
                    <div className="fw-bold fs-4">₹{equipment.deposit}</div>
                  </div>
                </div>
              </div>

              <div className="border rounded-4 p-4 mb-4 bg-light">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Location</span>
                  <strong>{equipment.location || "Not specified"}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Quantity</span>
                  <strong>{equipment.quantity || 1}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Brand</span>
                  <strong>{equipment.brand || "N/A"}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Rating</span>
                  <strong>{equipment.averageRating || 0}/5</strong>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="fw-semibold">Description</h5>
                <p className="text-muted mb-0">{equipment.description || "No description provided yet."}</p>
              </div>

              <div className="border-top pt-4">
                <h5 className="fw-semibold">Owner</h5>
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px" }}>
                    {equipment.owner?.name?.charAt(0) || "O"}
                  </div>
                  <div>
                    <div className="fw-semibold">{equipment.owner?.name || "Owner"}</div>
                    <div className="text-muted small">{equipment.owner?.email || "Contact available through booking"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-1">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Reviews</h4>
                <span className="badge bg-light text-dark">{reviews.length} reviews</span>
              </div>

              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div key={review._id || index} className="border rounded-4 p-3 mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong>{review.customer?.name || "Customer"}</strong>
                      <div>{renderStars(review.rating)}</div>
                    </div>
                    <p className="text-muted mb-0">{review.review}</p>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted py-4">No reviews yet for this equipment.</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <h4 className="fw-bold mb-4">Similar Equipment</h4>
              <div className="d-flex flex-column gap-3">
                {similar.length > 0 ? (
                  similar.map((item) => (
                    <Link to={`/equipment/${item._id}`} key={item._id} className="text-decoration-none text-dark">
                      <div className="border rounded-4 p-3 hover-shadow-sm">
                        <div className="fw-semibold">{item.name}</div>
                        <div className="small text-muted">{item.category}</div>
                        <div className="small text-primary fw-semibold mt-1">₹{item.pricePerDay}/day</div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-muted">No similar items available right now.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EquipmentDetails;
