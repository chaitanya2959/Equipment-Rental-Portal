import { Link, useLocation, Navigate } from "react-router-dom";
import { FaCalendarCheck, FaClipboardCheck, FaEnvelope, FaPhone } from "react-icons/fa6";
import BackButton from "../../components/Common/BackButton";

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

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

function BookingSuccess() {
  const location = useLocation();
  const booking = location.state?.booking;

  if (!booking) {
    return <Navigate to="/customer/bookings" replace />;
  }

  const equipment = booking.equipment || {};
  const owner = booking.owner || {};
  const totalDays = booking.totalDays || Math.max(1, Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24)) + 1);

  const summaryItems = [
    { label: "Booking Number", value: booking.bookingNumber || booking._id },
    { label: "Equipment Name", value: equipment.name || "Equipment" },
    { label: "Owner Name", value: owner.name || "Owner" },
    { label: "Pickup Date", value: formatDate(booking.startDate) },
    { label: "Return Date", value: formatDate(booking.endDate) },
    { label: "Total Days", value: totalDays },
    { label: "Price Per Day", value: formatCurrency(booking.pricePerDay || equipment.pricePerDay) },
    { label: "Deposit", value: formatCurrency(booking.depositAmount || equipment.deposit) },
    { label: "Total Amount", value: formatCurrency(booking.totalAmount) },
    { label: "Payment Method", value: booking.paymentMethod || "Cash" },
    { label: "Payment Status", value: booking.paymentStatus || "Pending" },
    { label: "Booking Status", value: booking.status || "Pending" },
  ];

  return (
    <div className="public-section">
      <div className="container-fluid">
        <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap mb-4">
          <div className="d-flex align-items-center gap-3">
            <BackButton fallbackTo="/customer/bookings" label="Back" />
            <div>
              <span className="public-section-pill mb-3">
                <FaCalendarCheck />
                Booking confirmed
              </span>
              <h1 className="public-section-title mb-2">Your booking was created successfully.</h1>
              <p className="public-section-copy mb-0">
                Keep this summary for pickup and communication with the owner.
              </p>
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <Link className="btn btn-outline-primary rounded-pill" to="/customer/bookings">
              View bookings
            </Link>
            <Link className="btn btn-primary rounded-pill" to="/customer/equipment">
              Browse more equipment
            </Link>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-xl-8">
            <div className="public-booking-summary p-4 p-lg-5">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                <div>
                  <div className="text-uppercase small fw-semibold text-primary mb-2">Booking summary</div>
                  <h2 className="h3 fw-bold mb-0">{equipment.name || "Equipment"}</h2>
                </div>
                <div className="text-end">
                  <div className="fw-bold fs-5">{booking.bookingNumber || booking._id}</div>
                  <div className="public-quiet-note small">Booking number</div>
                </div>
              </div>

              <div className="row g-3">
                {summaryItems.map((item) => (
                  <div className="col-12 col-md-6" key={item.label}>
                    <div className="public-mini-card h-100">
                      <div className="public-quiet-note small">{item.label}</div>
                      <div className="fw-semibold">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="public-surface-card p-4 p-lg-5 h-100">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="public-category-icon">
                  <FaClipboardCheck />
                </div>
                <div>
                  <div className="fw-bold">Owner contact</div>
                  <div className="public-quiet-note small">Use this information for pickup coordination</div>
                </div>
              </div>

              <div className="d-grid gap-3">
                <div className="public-contact-card">
                  <div className="fw-bold mb-1">{owner.name || "Owner"}</div>
                  <div className="public-quiet-note small">{owner.businessName || "Business name unavailable"}</div>
                </div>
                <div className="public-contact-card">
                  <div className="d-flex align-items-center gap-2">
                    <FaPhone className="text-primary" />
                    <span>{owner.phone || "Phone unavailable"}</span>
                  </div>
                </div>
                <div className="public-contact-card">
                  <div className="d-flex align-items-center gap-2">
                    <FaEnvelope className="text-primary" />
                    <span>{owner.email || "Email unavailable"}</span>
                  </div>
                </div>
                <div className="public-reminder">
                  <div className="fw-bold mb-1">Payment</div>
                  <div className="small">
                    {booking.paymentStatus || "Pending"} via {booking.paymentMethod || "Cash"}.
                  </div>
                </div>
                <div className="public-reminder">
                  <div className="fw-bold mb-1">Pickup reminder</div>
                  <div className="small">
                    {booking.startDate ? `Pickup on ${formatDate(booking.startDate)}.` : "Pickup date will appear here."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingSuccess;
