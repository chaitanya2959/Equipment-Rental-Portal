import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarDays,
  FaHeart,
  FaLocationDot,
  FaRegCircleCheck,
  FaShieldHeart,
  FaStar,
  FaTruckFast,
  FaUserTie,
} from "react-icons/fa6";
import api from "../../services/api";
import { addToWishlist } from "../../services/wishlistService";
import { createBooking } from "../../services/bookingService";
import "../../components/Customer/customer-layout.css";
import "./equipment-details.css";

const imageBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const placeholderImage = "https://via.placeholder.com/1200x800?text=Equipment+Image";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

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

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const getImageUrl = (equipment) => {
  const image = equipment?.images?.[0];
  if (!image) return placeholderImage;
  if (/^https?:\/\//i.test(image)) return image;
  return `${imageBaseUrl}/uploads/${image}`;
};

function EquipmentDetails() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [bookingForm, setBookingForm] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    let active = true;

    const fetchEquipment = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/equipment/${id}`);
        if (!active) return;
        setEquipment(response?.data?.data || null);
      } catch (fetchError) {
        if (!active) return;
        setError(fetchError?.response?.data?.message || "Unable to load equipment details.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchEquipment();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (searchParams.get("book") === "1") {
      setBookingOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const todayValue = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const bookingDays = useMemo(() => {
    if (!bookingForm.startDate || !bookingForm.endDate) return 0;
    const start = new Date(bookingForm.startDate);
    const end = new Date(bookingForm.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }, [bookingForm.startDate, bookingForm.endDate]);

  const estimatedAmount = useMemo(() => {
    const pricePerDay = Number(equipment?.pricePerDay || 0);
    return bookingDays * pricePerDay;
  }, [bookingDays, equipment?.pricePerDay]);

  const bookingValidationError = useMemo(() => {
    if (!bookingForm.startDate || !bookingForm.endDate) return "";
    const start = new Date(bookingForm.startDate);
    const end = new Date(bookingForm.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Select valid booking dates.";
    if (start < today) return "Past dates are not allowed.";
    if (end < start) return "End date must be after the start date.";
    return "";
  }, [bookingForm.endDate, bookingForm.startDate]);

  const canSubmitBooking = Boolean(
    equipment &&
      bookingForm.startDate &&
      bookingForm.endDate &&
      bookingDays > 0 &&
      !bookingValidationError &&
      !bookingLoading,
  );

  const handleWishlist = async () => {
    try {
      setSavingWishlist(true);
      await addToWishlist(equipment?._id);
      setToast("Added to wishlist.");
    } catch (wishlistError) {
      setToast(wishlistError?.response?.data?.message || "Unable to update wishlist.");
    } finally {
      setSavingWishlist(false);
    }
  };

  const handleBookingSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmitBooking) return;

    try {
      setBookingLoading(true);
      const created = await createBooking({
        equipment: equipment._id,
        startDate: bookingForm.startDate,
        endDate: bookingForm.endDate,
      });

      setToast(`Booking ${created?.bookingNumber || "created"} successfully.`);
      setBookingOpen(false);
      setBookingForm({ startDate: "", endDate: "" });
      setSearchParams((current) => {
        current.delete("book");
        return current;
      }, { replace: true });
      await api.get(`/equipment/${id}`).then((response) => setEquipment(response?.data?.data || null));
    } catch (bookingError) {
      setToast(bookingError?.response?.data?.message || "Unable to create booking.");
    } finally {
      setBookingLoading(false);
    }
  };

  const closeBookingModal = () => {
    setBookingOpen(false);
    setSearchParams((current) => {
      current.delete("book");
      return current;
    }, { replace: true });
  };

  const bookingSummary = [
    { label: "Price per day", value: formatCurrency(equipment?.pricePerDay) },
    { label: "Deposit", value: formatCurrency(equipment?.deposit) },
    { label: "Condition", value: equipment?.condition || "—" },
    { label: "Availability", value: equipment?.available ? "Available" : equipment?.status || "Unavailable" },
  ];

  return (
    <div className="customer-equipment-details">
      <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
        <Link className="btn btn-light rounded-pill" to="/customer/equipment">
          <FaArrowLeft />
          <span>Back to equipment</span>
        </Link>
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-outline-danger rounded-pill" type="button" onClick={handleWishlist} disabled={savingWishlist || loading || !equipment}>
            <FaHeart />
            <span>{savingWishlist ? "Saving..." : "Wishlist"}</span>
          </button>
          <button className="btn btn-primary rounded-pill" type="button" onClick={() => setBookingOpen(true)} disabled={loading || !equipment}>
            <FaCalendarDays />
            <span>Book Now</span>
          </button>
        </div>
      </div>

      {toast ? <div className="alert alert-success">{toast}</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading equipment details...</p>
        </div>
      ) : !equipment ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <h4 className="fw-semibold mb-2">Equipment not found</h4>
          <p className="text-muted mb-0">The requested listing is unavailable or has been removed.</p>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-12 col-xl-8">
            <article className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
              <div className="position-relative">
                <img
                  alt={equipment.name}
                  className="img-fluid w-100"
                  src={getImageUrl(equipment)}
                  style={{ maxHeight: "500px", objectFit: "cover" }}
                  onError={(event) => {
                    event.currentTarget.src = placeholderImage;
                  }}
                />
                <div className="position-absolute top-0 end-0 p-3">
                  <span className={`badge ${equipment.available ? "bg-success" : "bg-secondary"}`}>
                    {equipment.available ? "Available now" : equipment.status || "Unavailable"}
                  </span>
                </div>
              </div>

              <div className="card-body p-4 p-lg-5">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                  <span className="badge bg-primary-subtle text-primary">{equipment.category || "Uncategorized"}</span>
                  <span className="badge bg-light text-dark">{equipment.brand || "No brand"}</span>
                  {equipment.modelNumber ? <span className="badge bg-light text-dark">{equipment.modelNumber}</span> : null}
                </div>

                <h1 className="fw-bold mb-2">{equipment.name}</h1>
                <div className="d-flex flex-wrap gap-3 text-muted mb-4">
                  <span className="d-inline-flex align-items-center gap-2">
                    <FaLocationDot />
                    {equipment.location || "Location unavailable"}
                  </span>
                  <span className="d-inline-flex align-items-center gap-2">
                    <FaStar className="text-warning" />
                    {Number(equipment.averageRating || 0).toFixed(1)} rating
                  </span>
                  <span className="d-inline-flex align-items-center gap-2">
                    <FaRegCircleCheck />
                    {equipment.totalReviews || 0} reviews
                  </span>
                </div>

                <p className="text-muted mb-0" style={{ fontSize: "1.02rem" }}>
                  {equipment.description}
                </p>

                <div className="row g-3 mt-4">
                  {bookingSummary.map((item) => (
                    <div className="col-12 col-md-6" key={item.label}>
                      <div className="border rounded-4 p-3 h-100">
                        <div className="text-muted small">{item.label}</div>
                        <div className="fw-semibold">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </div>

          <div className="col-12 col-xl-4">
            <aside className="card border-0 shadow-sm rounded-4 sticky-top" style={{ top: "88px" }}>
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                  <div>
                    <div className="text-muted small">Price per day</div>
                    <div className="fs-2 fw-bold text-primary">{formatCurrency(equipment.pricePerDay)}</div>
                  </div>
                  <span className="badge bg-light text-dark">{equipment.quantity || 1} unit(s)</span>
                </div>

                <div className="border rounded-4 p-3 mb-4 bg-light">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <FaShieldHeart className="text-primary" />
                    <strong>Owner information</strong>
                  </div>
                  <div className="fw-semibold">{equipment.owner?.name || "Owner details not available"}</div>
                  <div className="text-muted small">{equipment.owner?.email || "Contact shared after booking"}</div>
                </div>

                <div className="border rounded-4 p-3 mb-4">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <FaTruckFast className="text-primary" />
                    <strong>Rental snapshot</strong>
                  </div>
                  <div className="d-flex justify-content-between small mb-2">
                    <span className="text-muted">Deposit</span>
                    <strong>{formatCurrency(equipment.deposit)}</strong>
                  </div>
                  <div className="d-flex justify-content-between small mb-2">
                    <span className="text-muted">Condition</span>
                    <strong>{equipment.condition || "—"}</strong>
                  </div>
                  <div className="d-flex justify-content-between small">
                    <span className="text-muted">Added on</span>
                    <strong>{formatDate(equipment.createdAt)}</strong>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button className="btn btn-primary btn-lg rounded-pill" type="button" onClick={() => setBookingOpen(true)} disabled={!equipment.available}>
                    Book Equipment
                  </button>
                  <button className="btn btn-outline-danger btn-lg rounded-pill" type="button" onClick={handleWishlist} disabled={savingWishlist}>
                    <FaHeart />
                    <span>{savingWishlist ? "Saving..." : "Save to Wishlist"}</span>
                  </button>
                </div>

                {!equipment.available ? (
                  <div className="alert alert-warning mt-4 mb-0">
                    This equipment is currently not available for new bookings.
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      )}

      {bookingOpen && equipment ? (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(15, 23, 42, 0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title mb-1">Book Equipment</h5>
                  <div className="text-muted small">{equipment.name}</div>
                </div>
                <button type="button" className="btn-close" onClick={closeBookingModal} />
              </div>

              <form onSubmit={handleBookingSubmit}>
                <div className="modal-body">
                  <div className="row g-4">
                    <div className="col-12 col-lg-5">
                      <div className="border rounded-4 overflow-hidden h-100">
                        <img
                          alt={equipment.name}
                          className="img-fluid w-100"
                          src={getImageUrl(equipment)}
                          style={{ height: "100%", minHeight: "260px", objectFit: "cover" }}
                          onError={(event) => {
                            event.currentTarget.src = placeholderImage;
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-12 col-lg-7">
                      <div className="row g-3">
                        <div className="col-12 col-md-6">
                          <label className="form-label fw-semibold">Start Date</label>
                          <input
                            className="form-control"
                            min={todayValue}
                            onChange={(event) =>
                              setBookingForm((current) => ({
                                ...current,
                                startDate: event.target.value,
                              }))
                            }
                            type="date"
                            value={bookingForm.startDate}
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label fw-semibold">End Date</label>
                          <input
                            className="form-control"
                            min={bookingForm.startDate || todayValue}
                            onChange={(event) =>
                              setBookingForm((current) => ({
                                ...current,
                                endDate: event.target.value,
                              }))
                            }
                            type="date"
                            value={bookingForm.endDate}
                          />
                        </div>
                      </div>

                      {bookingValidationError ? <div className="alert alert-danger mt-3 mb-0">{bookingValidationError}</div> : null}

                      <div className="row g-3 mt-3">
                        <div className="col-12 col-md-4">
                          <div className="border rounded-4 p-3 h-100">
                            <div className="text-muted small">Days</div>
                            <div className="fw-bold fs-5">{bookingDays || 0}</div>
                          </div>
                        </div>
                        <div className="col-12 col-md-4">
                          <div className="border rounded-4 p-3 h-100">
                            <div className="text-muted small">Price per Day</div>
                            <div className="fw-bold fs-5">{formatCurrency(equipment.pricePerDay)}</div>
                          </div>
                        </div>
                        <div className="col-12 col-md-4">
                          <div className="border rounded-4 p-3 h-100">
                            <div className="text-muted small">Deposit</div>
                            <div className="fw-bold fs-5">{formatCurrency(equipment.deposit)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-4 p-3 mt-3 bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted">Estimated Total</span>
                          <strong className="fs-4">{formatCurrency(estimatedAmount)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn btn-outline-secondary" type="button" onClick={closeBookingModal} disabled={bookingLoading}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" type="submit" disabled={!canSubmitBooking}>
                    {bookingLoading ? "Booking..." : "Confirm Booking"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {bookingOpen ? <div className="modal-backdrop fade show" /> : null}
    </div>
  );
}

export default EquipmentDetails;
