import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaCalendarDays,
  FaHeart,
  FaLocationDot,
  FaRegCircleCheck,
  FaShieldHeart,
  FaStar,
  FaTruckFast,
  FaCommentDots,
  FaPaperPlane,
} from "react-icons/fa6";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { addToWishlist } from "../../services/wishlistService";
import { createBooking } from "../../services/bookingService";
import {
  appendMessage,
  getThreadByContext,
  subscribeToChatChanges,
} from "../../services/chatService";
import BackButton from "../../components/Common/BackButton";
import "../../components/Customer/customer-layout.css";
import "./equipment-details.css";

const imageBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");
const placeholderImage =
  "https://via.placeholder.com/1200x800?text=Equipment+Image";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "â€”";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "â€”";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getTodayInputValue = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const parseDateInputValue = (value) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getImageUrl = (equipment) => {
  const image = equipment?.images?.[0];
  if (!image) return placeholderImage;
  if (/^https?:\/\//i.test(image)) return image;
  return `${imageBaseUrl}/uploads/${image}`;
};

const renderStars = (value = 0, onSelect = null) =>
  Array.from({ length: 5 }, (_, index) => {
    const active = index < Number(value || 0);
    return (
      <button
        className="btn btn-link p-0 equipment-star-button"
        key={index}
        type="button"
        onClick={() => onSelect?.(index + 1)}
        aria-label={`Rate ${index + 1} star${index > 0 ? "s" : ""}`}
      >
        <FaStar
          className={active ? "text-warning" : "text-secondary opacity-25"}
        />
      </button>
    );
  });

function EquipmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewToast, setReviewToast] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, review: "" });
  const [bookings, setBookings] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatThread, setChatThread] = useState(null);
  const [toast, setToast] = useState("");
  const [bookingForm, setBookingForm] = useState({
    startDate: "",
    endDate: "",
  });
  const canUseCustomerActions = isAuthenticated && user?.role === "customer";

  const promptLogin = () => {
    navigate("/login", { replace: true, state: { from: location } });
  };

  useEffect(() => {
    let active = true;

    const fetchEquipment = async () => {
      try {
        setLoading(true);
        setError("");
        const [equipmentRes, reviewsRes, bookingsRes] = await Promise.all([
          api.get(`/equipment/${id}`),
          api.get(`/reviews/${id}`).catch(() => ({ data: { data: [] } })),
          api.get("/booking/my-bookings").catch(() => ({ data: { data: [] } })),
        ]);

        if (!active) return;

        const equipmentData = equipmentRes?.data?.data || null;
        const reviewData = reviewsRes?.data?.data || [];
        const bookingData = bookingsRes?.data?.data || [];

        setEquipment(equipmentData);
        setReviews(reviewData);
        setBookings(bookingData);
        setReviewLoading(false);
      } catch (fetchError) {
        if (!active) return;
        setError(
          fetchError?.response?.data?.message ||
            "Unable to load equipment details.",
        );
      } finally {
        if (active) {
          setLoading(false);
          setReviewLoading(false);
        }
      }
    };

    fetchEquipment();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!reviewToast) return undefined;
    const timer = setTimeout(() => setReviewToast(""), 2500);
    return () => clearTimeout(timer);
  }, [reviewToast]);

  useEffect(() => {
    document.body.classList.toggle("customer-modal-open", bookingOpen || reviewOpen || chatOpen);
    return () => {
      document.body.classList.remove("customer-modal-open");
    };
  }, [bookingOpen, chatOpen, reviewOpen]);

  useEffect(() => {
    if (!equipment || !canUseCustomerActions || !user) {
      setChatThread(null);
      return undefined;
    }

    const syncThread = () => {
      const thread = getThreadByContext({
        equipment,
        customer: user,
        owner: equipment.owner,
      });
      setChatThread(thread || null);
    };

    syncThread();

    const unsubscribe = subscribeToChatChanges(syncThread);
    return () => unsubscribe();
  }, [canUseCustomerActions, equipment, user]);

  const todayValue = getTodayInputValue();

  const bookingDays = useMemo(() => {
    const start = parseDateInputValue(bookingForm.startDate);
    const end = parseDateInputValue(bookingForm.endDate);
    if (!start || !end || end < start) return 0;
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }, [bookingForm.startDate, bookingForm.endDate]);

  const estimatedAmount = useMemo(() => {
    const pricePerDay = Number(equipment?.pricePerDay || 0);
    return bookingDays * pricePerDay;
  }, [bookingDays, equipment?.pricePerDay]);

  const bookingFieldErrors = useMemo(() => {
    const errors = {
      startDate: "",
      endDate: "",
    };
    const start = bookingForm.startDate;
    const end = bookingForm.endDate;

    if (start && start < todayValue) {
      errors.startDate = "Select a valid start date.";
    }

    if (end && end < todayValue) {
      errors.endDate = "Select a valid end date.";
    } else if (start && end && end < start) {
      errors.endDate = "End date cannot be before the start date.";
    }

    return errors;
  }, [bookingForm.endDate, bookingForm.startDate, todayValue]);

  useEffect(() => {
    if (!bookingForm.startDate || !bookingForm.endDate) return;
    if (bookingForm.endDate < bookingForm.startDate) {
      setBookingForm((current) => ({
        ...current,
        endDate: "",
      }));
    }
  }, [bookingForm.endDate, bookingForm.startDate]);

  const canSubmitBooking = Boolean(
    equipment &&
    bookingForm.startDate &&
    bookingForm.endDate &&
    bookingDays > 0 &&
    !bookingFieldErrors.startDate &&
    !bookingFieldErrors.endDate &&
    !bookingLoading,
  );

  const handleWishlist = async () => {
    if (!canUseCustomerActions) {
      promptLogin();
      return;
    }

    try {
      setSavingWishlist(true);
      await addToWishlist(equipment?._id);
      setToast("Added to wishlist.");
    } catch (wishlistError) {
      setToast(
        wishlistError?.response?.data?.message || "Unable to update wishlist.",
      );
    } finally {
      setSavingWishlist(false);
    }
  };

  const eligibleToReview = useMemo(
    () =>
      canUseCustomerActions &&
      bookings.some(
        (booking) =>
          booking.equipment?._id === equipment?._id &&
          booking.status === "Completed",
      ),
    [bookings, canUseCustomerActions, equipment?._id],
  );

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    return (
      reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
      reviews.length
    );
  }, [reviews]);

  const totalReviews = reviews.length;
  const chatMessages = chatThread?.messages || [];

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!equipment || !reviewForm.review.trim()) return;

    try {
      setReviewSubmitting(true);
      setReviewError("");
      const response = await api.post("/reviews", {
        equipment: equipment._id,
        rating: Number(reviewForm.rating),
        review: reviewForm.review.trim(),
      });

      const savedReview = response?.data?.data || null;
      if (savedReview) {
        setReviews((current) => {
          const next = current.filter((item) => item._id !== savedReview._id);
          return [savedReview, ...next].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          );
        });
      } else {
        const refresh = await api
          .get(`/reviews/${equipment._id}`)
          .catch(() => ({ data: { data: [] } }));
        setReviews(refresh?.data?.data || []);
      }

      const updatedEquipment = await api.get(`/equipment/${equipment._id}`);
      setEquipment(updatedEquipment?.data?.data || equipment);
      setReviewOpen(false);
      setReviewForm({ rating: 5, review: "" });
      setReviewToast("Review submitted successfully.");
    } catch (reviewSubmitError) {
      setReviewError(
        reviewSubmitError?.response?.data?.message ||
          "Unable to submit review.",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleChatSend = (event) => {
    event.preventDefault();
    if (!canUseCustomerActions) {
      promptLogin();
      return;
    }

    const text = chatInput.trim();
    if (!text) return;

    const nextThread = appendMessage({
      equipment,
      customer: user,
      owner: equipment?.owner,
      sender: "customer",
      text,
    });

    if (nextThread) {
      setChatThread(nextThread);
    }

    setChatInput("");
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

      navigate("/customer/bookings/success", {
        replace: true,
        state: { booking: created },
      });
      setBookingOpen(false);
      setBookingForm({ startDate: "", endDate: "" });
    } catch (bookingError) {
      setToast(
        bookingError?.response?.data?.message || "Unable to create booking.",
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const closeBookingModal = () => {
    setBookingOpen(false);
  };

  const equipmentOverviewSummary = [
    { label: "Price per day", value: formatCurrency(equipment?.pricePerDay) },
    { label: "Deposit", value: formatCurrency(equipment?.deposit) },
    { label: "Condition", value: equipment?.condition || "Ã¢â‚¬â€" },
    {
      label: "Availability",
      value: equipment?.available
        ? "Available"
        : equipment?.status || "Unavailable",
    },
  ];

  const bookingSummary = [
    {
      label: "Start Date",
      value: bookingForm.startDate
        ? formatDate(bookingForm.startDate)
        : "Select a start date",
    },
    {
      label: "End Date",
      value: bookingForm.endDate
        ? formatDate(bookingForm.endDate)
        : "Select an end date",
    },
    {
      label: "Total Rental Days",
      value:
        bookingDays > 0
          ? `${bookingDays} day${bookingDays > 1 ? "s" : ""}`
          : "Select dates",
    },
    { label: "Price Per Day", value: formatCurrency(equipment?.pricePerDay) },
    { label: "Deposit", value: formatCurrency(equipment?.deposit) },
    { label: "Total Amount", value: formatCurrency(estimatedAmount) },
  ];

  return (
    <div className="container-xxl py-4 customer-equipment-details">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <BackButton label="Back" fallbackTo="/customer/equipment" />
          <div>
            <p className="text-uppercase small fw-semibold text-primary mb-2 mb-lg-1">
              Equipment details
            </p>
            <h2 className="fw-bold mb-0">{equipment?.name || "Equipment"}</h2>
          </div>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button
            className="btn btn-outline-secondary rounded-pill"
            type="button"
            onClick={() =>
              canUseCustomerActions ? setChatOpen(true) : promptLogin()
            }
            disabled={loading || !equipment}
          >
            <FaCommentDots />
            <span>
              {canUseCustomerActions ? "Chat with owner" : "Login to chat"}
            </span>
          </button>
          <button
            className="btn btn-outline-danger rounded-pill"
            type="button"
            onClick={handleWishlist}
            disabled={savingWishlist || loading || !equipment}
          >
            <FaHeart />
            <span>
              {savingWishlist
                ? "Saving..."
                : canUseCustomerActions
                  ? "Wishlist"
                  : "Login to wishlist"}
            </span>
          </button>
          <button
            className="btn btn-primary rounded-pill"
            type="button"
            onClick={() =>
              canUseCustomerActions ? setBookingOpen(true) : promptLogin()
            }
            disabled={loading || !equipment}
          >
            <FaCalendarDays />
            <span>{canUseCustomerActions ? "Book Now" : "Login to book"}</span>
          </button>
        </div>
      </div>

      {toast ? <div className="alert alert-success">{toast}</div> : null}
      {reviewToast ? (
        <div className="alert alert-success">{reviewToast}</div>
      ) : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}
      {reviewError ? (
        <div className="alert alert-danger">{reviewError}</div>
      ) : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading equipment details...</p>
        </div>
      ) : !equipment ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <h4 className="fw-semibold mb-2">Equipment not found</h4>
          <p className="text-muted mb-0">
            The requested listing is unavailable or has been removed.
          </p>
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
                  <span
                    className={`badge ${equipment.available ? "bg-success" : "bg-secondary"}`}
                  >
                    {equipment.available
                      ? "Available now"
                      : equipment.status || "Unavailable"}
                  </span>
                </div>
              </div>

              <div className="card-body p-4 p-lg-5">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                  <span className="badge bg-primary-subtle text-primary">
                    {equipment.category || "Uncategorized"}
                  </span>
                  <span className="badge bg-light text-dark">
                    {equipment.brand || "No brand"}
                  </span>
                  {equipment.modelNumber ? (
                    <span className="badge bg-light text-dark">
                      {equipment.modelNumber}
                    </span>
                  ) : null}
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
                  {equipmentOverviewSummary.map((item) => (
                    <div className="col-12 col-md-6" key={item.label}>
                      <div className="border rounded-4 p-3 h-100">
                        <div className="text-muted small">{item.label}</div>
                        <div className="fw-semibold">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="row g-3 mt-2">
                  <div className="col-12 col-md-4">
                    <div className="border rounded-4 p-3 h-100 bg-light">
                      <div className="text-muted small">Average rating</div>
                      <div className="fw-bold fs-4 d-flex align-items-center gap-2">
                        <FaStar className="text-warning" />
                        {averageRating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="border rounded-4 p-3 h-100 bg-light">
                      <div className="text-muted small">Total reviews</div>
                      <div className="fw-bold fs-4">{totalReviews}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="border rounded-4 p-3 h-100 bg-light">
                      <div className="text-muted small">Review status</div>
                      <div className="fw-semibold">
                        {eligibleToReview
                          ? "You can add a review"
                          : "Complete a booking to review"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className="col-12 col-xl-4">
            <aside
              className="card border-0 shadow-sm rounded-4 sticky-top"
              style={{ top: "88px" }}
            >
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                  <div>
                    <div className="text-muted small">Price per day</div>
                    <div className="fs-2 fw-bold text-primary">
                      {formatCurrency(equipment.pricePerDay)}
                    </div>
                  </div>
                  <span className="badge bg-light text-dark">
                    {equipment.quantity || 1} unit(s)
                  </span>
                </div>

                <div className="border rounded-4 p-3 mb-4 bg-light">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <FaShieldHeart className="text-primary" />
                    <strong>Owner information</strong>
                  </div>
                  <div className="fw-semibold">
                    {equipment.owner?.name || "Owner details not available"}
                  </div>
                  <div className="text-muted small">
                    {equipment.owner?.email || "Contact shared after booking"}
                  </div>
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
                    <strong>{equipment.condition || "â€”"}</strong>
                  </div>
                  <div className="d-flex justify-content-between small">
                    <span className="text-muted">Added on</span>
                    <strong>{formatDate(equipment.createdAt)}</strong>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button
                    className="btn btn-primary btn-lg rounded-pill"
                    type="button"
                    onClick={() =>
                      canUseCustomerActions
                        ? setBookingOpen(true)
                        : promptLogin()
                    }
                    disabled={!equipment.available && canUseCustomerActions}
                  >
                    {canUseCustomerActions ? "Book Equipment" : "Login to book"}
                  </button>
                  <button
                    className="btn btn-outline-danger btn-lg rounded-pill"
                    type="button"
                    onClick={handleWishlist}
                    disabled={savingWishlist}
                  >
                    <FaHeart />
                    <span>
                      {savingWishlist
                        ? "Saving..."
                        : canUseCustomerActions
                          ? "Save to Wishlist"
                          : "Login to wishlist"}
                    </span>
                  </button>
                </div>

                {!canUseCustomerActions ? (
                  <div className="alert alert-primary mt-4 mb-0">
                    Login to book, save to wishlist, chat with the owner, or
                    submit a review.
                  </div>
                ) : !equipment.available ? (
                  <div className="alert alert-warning mt-4 mb-0">
                    This equipment is currently not available for new bookings.
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      )}

      {!loading && equipment ? (
        <div className="row g-4 mt-1">
          <div className="col-12 col-xl-7">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                  <div>
                    <p className="text-uppercase small fw-semibold text-primary mb-2">
                      Customer reviews
                    </p>
                    <h3 className="fw-bold mb-0">Ratings and feedback</h3>
                  </div>
                  <button
                    className="btn btn-outline-primary rounded-pill"
                    type="button"
                    onClick={() =>
                      canUseCustomerActions
                        ? setReviewOpen(true)
                        : promptLogin()
                    }
                    disabled={!eligibleToReview}
                  >
                    <FaStar className="me-2" />
                    {canUseCustomerActions ? "Add review" : "Login"}
                  </button>
                </div>

                {reviewLoading ? (
                  <div className="text-center py-4 text-muted">
                    Loading reviews...
                  </div>
                ) : !canUseCustomerActions ? (
                  <div className="alert alert-light border mb-0">
                    Log in after a completed booking to submit a review.
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="d-grid gap-3">
                    {reviews.map((review) => (
                      <div className="border rounded-4 p-4" key={review._id}>
                        <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-2">
                          <div>
                            <div className="fw-semibold">
                              {review.customer?.name || "Customer"}
                            </div>
                            <div className="text-muted small">
                              {formatDate(review.createdAt)}
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <div className="review-rating">
                              {renderStars(review.rating)}
                            </div>
                            <span className="fw-semibold">
                              {Number(review.rating || 0).toFixed(1)}/5
                            </span>
                            <Link
                              className="btn btn-outline-secondary btn-sm rounded-pill"
                              to={`/customer/reviews/${review._id}?equipmentId=${equipment._id}`}
                            >
                              Details
                            </Link>
                          </div>
                        </div>
                        <p className="mb-0 text-muted">
                          {review.review || "No review text provided."}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-light border mb-0">
                    No reviews yet for this equipment.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-5">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                  <div>
                    <p className="text-uppercase small fw-semibold text-primary mb-2">
                      Chat preview
                    </p>
                    <h3 className="fw-bold mb-0">Customer and owner chat</h3>
                  </div>
                  <button
                    className="btn btn-outline-primary rounded-pill"
                    type="button"
                    onClick={() =>
                      canUseCustomerActions ? setChatOpen(true) : promptLogin()
                    }
                  >
                    <FaCommentDots className="me-2" />
                    {canUseCustomerActions ? "Open" : "Login"}
                  </button>
                </div>

                {canUseCustomerActions ? (
                  chatMessages.length > 0 ? (
                    <div className="chat-preview-list">
                      {chatMessages.map((message) => (
                        <div
                          className={`chat-preview-message ${message.sender === "customer" ? "is-customer" : "is-owner"}`}
                          key={message.id}
                        >
                          <div className="chat-preview-bubble">
                            {message.text}
                          </div>
                          <div className="chat-preview-time">
                            {formatDate(message.time)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="chat-empty-state">
                      <FaCommentDots className="chat-empty-icon" />
                      <h5 className="fw-bold mb-2">Start the conversation</h5>
                      <p className="text-muted mb-0">
                        Send a message to the owner. Replies will appear here
                        once the owner responds.
                      </p>
                    </div>
                  )
                ) : (
                  <div className="alert alert-light border mb-0">
                    Login to open chat after the booking is approved.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {bookingOpen && equipment && canUseCustomerActions ? (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.5)" }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title mb-1">Book Equipment</h5>
                  <div className="text-muted small">{equipment.name}</div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeBookingModal}
                />
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
                          style={{
                            height: "100%",
                            minHeight: "260px",
                            objectFit: "cover",
                          }}
                          onError={(event) => {
                            event.currentTarget.src = placeholderImage;
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-12 col-lg-7">
                      <div className="booking-form-panel">
                        <div className="row g-3">
                          <div className="col-12 col-md-6">
                            <label className="form-label fw-semibold">
                              Start Date
                            </label>
                            <input
                              className={`form-control booking-date-input ${bookingFieldErrors.startDate ? "is-invalid" : ""}`}
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
                            {bookingFieldErrors.startDate ? (
                              <div className="booking-field-error">
                                {bookingFieldErrors.startDate}
                              </div>
                            ) : null}
                          </div>
                          <div className="col-12 col-md-6">
                            <label className="form-label fw-semibold">
                              End Date
                            </label>
                            <input
                              className={`form-control booking-date-input ${bookingFieldErrors.endDate ? "is-invalid" : ""}`}
                              min={bookingForm.startDate }
                              onChange={(event) =>
                                setBookingForm((current) => ({
                                  ...current,
                                  endDate: event.target.value,
                                }))
                              }
                              type="date"
                              value={bookingForm.endDate}
                            />
                            {bookingFieldErrors.endDate ? (
                              <div className="booking-field-error">
                                {bookingFieldErrors.endDate}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="booking-actions-row mt-3">
                          <div className="booking-date-help">
                            Click a date field to open the native calendar
                            picker.
                          </div>
                          <button
                            className="btn btn-outline-secondary btn-sm rounded-pill"
                            type="button"
                            onClick={() =>
                              setBookingForm({ startDate: "", endDate: "" })
                            }
                            disabled={
                              !bookingForm.startDate && !bookingForm.endDate
                            }
                          >
                            Clear dates
                          </button>
                        </div>

                        <div className="booking-summary-card mt-4">
                          <div className="booking-summary-header">
                            <div>
                              <div className="booking-summary-kicker">
                                Booking summary
                              </div>
                              <h5 className="booking-summary-title mb-0">
                                Live pricing and schedule
                              </h5>
                            </div>
                            <span className="booking-summary-pill">
                              {bookingDays > 0
                                ? `${bookingDays} day${bookingDays > 1 ? "s" : ""}`
                                : "Awaiting dates"}
                            </span>
                          </div>

                          <div className="booking-summary-grid mt-3">
                            {bookingSummary.map((item) => (
                              <div
                                className="booking-summary-item"
                                key={item.label}
                              >
                                <span>{item.label}</span>
                                <strong>{item.value}</strong>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="booking-total-card mt-4">
                          <div>
                            <div className="booking-summary-kicker">
                              Estimated total
                            </div>
                            <div className="booking-total-value">
                              {formatCurrency(estimatedAmount)}
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="booking-summary-kicker">
                              Deposit
                            </div>
                            <div className="booking-total-note">
                              {formatCurrency(equipment.deposit)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={closeBookingModal}
                    disabled={bookingLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={!canSubmitBooking}
                  >
                    {bookingLoading ? "Booking..." : "Confirm Booking"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {reviewOpen && equipment && canUseCustomerActions ? (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.5)" }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
          >
            <div className="modal-content">
              <form onSubmit={handleReviewSubmit}>
                <div className="modal-header">
                  <div>
                    <h5 className="modal-title mb-1">Add Review</h5>
                    <div className="text-muted small">{equipment.name}</div>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setReviewOpen(false)}
                  />
                </div>
                <div className="modal-body">
                  {!eligibleToReview ? (
                    <div className="alert alert-warning">
                      You can only review equipment after a completed booking.
                    </div>
                  ) : null}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Rating</label>
                    <div className="d-flex align-items-center gap-2 fs-3">
                      {renderStars(reviewForm.rating, (rating) =>
                        setReviewForm((current) => ({ ...current, rating })),
                      )}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Review</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      placeholder="Share your experience with this equipment..."
                      value={reviewForm.review}
                      onChange={(event) =>
                        setReviewForm((current) => ({
                          ...current,
                          review: event.target.value,
                        }))
                      }
                    />
                  </div>
                  {reviewError ? (
                    <div className="alert alert-danger mb-0">{reviewError}</div>
                  ) : null}
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setReviewOpen(false)}
                    disabled={reviewSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={reviewSubmitting || !reviewForm.review.trim()}
                  >
                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {chatOpen && equipment && canUseCustomerActions ? (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.5)" }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-xl"
            role="document"
          >
            <div className="modal-content rounded-4 border-0 overflow-hidden">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title mb-1">Chat with owner</h5>
                  <div className="text-muted small">
                    {equipment.owner?.name || "Owner"}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setChatOpen(false)}
                />
              </div>
              <div className="modal-body p-0">
                <div className="equipment-chat-panel">
                  <div className="equipment-chat-thread">
                    {chatMessages.length > 0 ? (
                      chatMessages.map((message) => (
                        <div
                          className={`equipment-chat-row ${message.sender === "customer" ? "is-customer" : "is-owner"}`}
                          key={message.id}
                        >
                          <div className="equipment-chat-bubble">
                            <div>{message.text}</div>
                            <div className="equipment-chat-time">
                              {formatDate(message.time)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="chat-empty-state">
                        <FaCommentDots className="chat-empty-icon" />
                        <h4 className="fw-bold mb-2">No messages yet</h4>
                        <p className="text-muted mb-0">
                          Start with a short note about dates, pickup, or
                          availability. The owner can reply in this thread.
                        </p>
                      </div>
                    )}
                  </div>
                  <form
                    className="equipment-chat-compose"
                    onSubmit={handleChatSend}
                  >
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Write a message..."
                      value={chatInput}
                      onChange={(event) => setChatInput(event.target.value)}
                    />
                    <button
                      className="btn btn-primary rounded-pill px-4"
                      type="submit"
                      disabled={!chatInput.trim()}
                    >
                      <FaPaperPlane className="me-2" />
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {bookingOpen ? <div className="modal-backdrop fade show" /> : null}
    </div>
  );
}

export default EquipmentDetails;
