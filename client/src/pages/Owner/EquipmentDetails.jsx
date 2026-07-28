import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaChartLine,
  FaCircleCheck,
  FaPenToSquare,
  FaStar,
  FaTrash,
  FaUpload,
} from "react-icons/fa6";
import API from "../../services/api";

const imageBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const placeholderImage = "https://via.placeholder.com/1200x800?text=No+Image";

const getImageUrl = (value) => {
  if (!value) return placeholderImage;
  if (/^https?:\/\//i.test(value)) return value;
  return `${imageBaseUrl}/uploads/${value}`;
};

const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-IN", {
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

function EquipmentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [equipment, setEquipment] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const [equipmentRes, reviewsRes, bookingsRes] = await Promise.all([
        API.get(`/equipment/${id}`),
        API.get(`/reviews/${id}`),
        API.get("/booking/owner"),
      ]);

      const equipmentData = equipmentRes?.data?.data || null;
      const reviewData = reviewsRes?.data?.data || [];
      const bookingData = bookingsRes?.data?.data || [];

      setEquipment(equipmentData);
      setReviews(reviewData);
      setBookings(bookingData.filter((booking) => booking.equipment?._id === equipmentData?._id || booking.equipment === equipmentData?._id));
      setSelectedImage(0);
    } catch (err) {
      console.error(err);
      setError("Unable to load equipment details right now.");
    } finally {
      setLoading(false);
    }
  };

  const imageList = useMemo(() => {
    if (!equipment?.images?.length) return [placeholderImage];
    return equipment.images.map((image) => getImageUrl(image));
  }, [equipment]);

  const reviewSummary = useMemo(() => {
    const total = reviews.length;
    const rating = total > 0 ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / total : 0;
    return { total, rating };
  }, [reviews]);

  const revenueSummary = useMemo(() => {
    const paidBookings = bookings.filter((booking) => booking.paymentStatus === "Paid" || booking.status === "Completed");
    const revenue = paidBookings.reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0);
    const deposit = paidBookings.reduce((sum, booking) => sum + Number(booking.depositAmount || 0), 0);
    return {
      revenue,
      deposit,
      paidCount: paidBookings.length,
    };
  }, [bookings]);

  const ownerNotes = useMemo(
    () => [
      `Listing created on ${formatDate(equipment?.createdAt)}.`,
      `Last updated on ${formatDate(equipment?.updatedAt)}.`,
      `${bookings.length} booking${bookings.length === 1 ? "" : "s"} linked to this equipment.`,
      `${reviews.length} customer review${reviews.length === 1 ? "" : "s"} recorded.`,
      `Current availability: ${equipment?.available ? "Available" : "Unavailable"}.`,
    ],
    [bookings.length, equipment?.available, equipment?.createdAt, equipment?.updatedAt, reviews.length]
  );

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await API.delete(`/equipment/${id}`);
      navigate("/owner/equipment");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to delete this equipment.");
    } finally {
      setDeleting(false);
    }
  };

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
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <Link to="/owner/equipment" className="btn btn-link ps-0 text-decoration-none">
            <FaArrowLeft className="me-2" />
            Back to My Equipment
          </Link>
          <h2 className="fw-bold mb-1">{equipment.name}</h2>
          <p className="text-muted mb-0">
            {equipment.category || "Uncategorized"} . {equipment.brand || "Brand not specified"} . {equipment.location || "Location not specified"}
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <Link className="btn btn-primary" to={`/owner/equipment/edit/${equipment._id}`}>
            <FaPenToSquare className="me-1" />
            Edit
          </Link>
          <Link className="btn btn-outline-dark" to={`/owner/equipment/edit/${equipment._id}#images`}>
            <FaUpload className="me-1" />
            Update Images
          </Link>
          <button type="button" className="btn btn-outline-danger" onClick={() => setShowDeleteModal(true)}>
            <FaTrash className="me-1" />
            Delete
          </button>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="position-relative">
              <img
                src={imageList[selectedImage]}
                alt={equipment.name}
                className="img-fluid w-100"
                style={{ height: "520px", objectFit: "cover" }}
              />
              <span className={`position-absolute top-0 start-0 m-3 badge ${equipment.available ? "bg-success" : "bg-secondary"} px-3 py-2`}>
                {equipment.available ? "Available" : "Unavailable"}
              </span>
            </div>

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

          <div className="card border-0 shadow-sm rounded-4 mt-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold mb-0">Equipment Information</h4>
                <span className="badge bg-light text-dark">Updated {formatDate(equipment.updatedAt)}</span>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="border rounded-4 p-3 h-100 bg-light">
                    <div className="text-muted small">Description</div>
                    <div className="fw-semibold mt-1">{equipment.description || "No description provided."}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="border rounded-4 p-3 h-100 bg-light">
                    <div className="text-muted small">Availability</div>
                    <div className="fw-semibold mt-1">{equipment.available ? "Available for booking" : "Not available for booking"}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded-4 p-3 h-100">
                    <div className="text-muted small">Price / day</div>
                    <div className="fw-bold fs-4">{formatCurrency(equipment.pricePerDay)}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded-4 p-3 h-100">
                    <div className="text-muted small">Deposit</div>
                    <div className="fw-bold fs-4">{formatCurrency(equipment.deposit)}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded-4 p-3 h-100">
                    <div className="text-muted small">Quantity</div>
                    <div className="fw-bold fs-4">{equipment.quantity || 1}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4 p-lg-5">
              <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                <div>
                  <p className="text-uppercase small fw-semibold text-primary mb-2">Owner equipment overview</p>
                  <h4 className="fw-bold mb-1">Performance Snapshot</h4>
                  <p className="text-muted mb-0">Live booking, review, and revenue data for this listing.</p>
                </div>
                <span className="badge bg-primary-subtle text-primary px-3 py-2">
                  <FaChartLine className="me-1" />
                  Live
                </span>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-6">
                  <div className="border rounded-4 p-3 h-100 bg-light">
                    <div className="text-muted small">Bookings</div>
                    <div className="fw-bold fs-4">{bookings.length}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded-4 p-3 h-100 bg-light">
                    <div className="text-muted small">Reviews</div>
                    <div className="fw-bold fs-4">{reviewSummary.total}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded-4 p-3 h-100 bg-light">
                    <div className="text-muted small">Average Rating</div>
                    <div className="fw-bold fs-4 d-flex align-items-center gap-2">
                      <FaStar className="text-warning" />
                      {reviewSummary.rating.toFixed(1)}
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded-4 p-3 h-100 bg-light">
                    <div className="text-muted small">Revenue</div>
                    <div className="fw-bold fs-4">{formatCurrency(revenueSummary.revenue)}</div>
                  </div>
                </div>
              </div>

              <div className="border rounded-4 p-4 mb-4 bg-light">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Category</span>
                  <strong>{equipment.category || "N/A"}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Brand</span>
                  <strong>{equipment.brand || "N/A"}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Location</span>
                  <strong>{equipment.location || "N/A"}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Created</span>
                  <strong>{formatDate(equipment.createdAt)}</strong>
                </div>
              </div>

              <div className="border rounded-4 p-4 mb-4">
                <h5 className="fw-semibold mb-3">Owner Notes</h5>
                <ul className="list-unstyled mb-0 d-grid gap-2">
                  {ownerNotes.map((note) => (
                    <li key={note} className="d-flex align-items-start gap-2">
                      <FaCircleCheck className="text-success mt-1" />
                      <span className="text-secondary">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="fw-semibold mb-3">Availability</h5>
                <div className="d-flex flex-wrap gap-2">
                  <span className={`badge px-3 py-2 ${equipment.available ? "bg-success" : "bg-secondary"}`}>
                    {equipment.available ? "Open for booking" : "Closed for booking"}
                  </span>
                  <span className="badge bg-light text-dark px-3 py-2">
                    {revenueSummary.paidCount} paid booking{revenueSummary.paidCount === 1 ? "" : "s"}
                  </span>
                  <span className="badge bg-light text-dark px-3 py-2">
                    Deposit collected: {formatCurrency(revenueSummary.deposit)}
                  </span>
                </div>
              </div>

              <div className="border-top mt-4 pt-4">
                <h5 className="fw-semibold mb-3">Recent Reviews</h5>
                <div className="d-grid gap-3">
                  {reviews.slice(0, 3).length > 0 ? (
                    reviews.slice(0, 3).map((review) => (
                      <div key={review._id} className="border rounded-4 p-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong>{review.customer?.name || "Customer"}</strong>
                          <span className="text-warning d-inline-flex align-items-center">
                            {Array.from({ length: Number(review.rating || 0) }, (_, index) => (
                              <FaStar key={index} className="me-1" />
                            ))}
                          </span>
                        </div>
                        <p className="mb-0 text-muted">{review.review}</p>
                        <div className="text-muted small mt-2">{formatDate(review.createdAt)}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted">No reviews yet for this equipment.</div>
                  )}
                </div>
              </div>

              <div className="border-top mt-4 pt-4">
                <h5 className="fw-semibold mb-3">Booking History</h5>
                {bookings.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Booking</th>
                          <th>Customer</th>
                          <th>Status</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 5).map((booking) => (
                          <tr key={booking._id}>
                            <td>
                              <div className="fw-semibold">{booking.bookingNumber || "N/A"}</div>
                              <div className="text-muted small">
                                {formatDate(booking.startDate)} to {formatDate(booking.endDate)}
                              </div>
                            </td>
                            <td>{booking.customer?.name || "Customer"}</td>
                            <td>
                              <span className="badge bg-light text-dark">{booking.status || "Pending"}</span>
                            </td>
                            <td>{formatCurrency(booking.totalAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-muted">No booking history available yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal ? (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Equipment</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)} />
              </div>
              <div className="modal-body">
                <p className="mb-0">
                  Are you sure you want to delete <strong>{equipment.name}</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default EquipmentDetails;
