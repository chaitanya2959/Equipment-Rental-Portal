import { useEffect, useMemo, useState } from "react";
import BackButton from "../../components/Common/BackButton";
import {
  FaChevronDown,
  FaChevronUp,
  FaCircleQuestion,
  FaEnvelope,
  FaHeadphones,
  FaMagnifyingGlass,
  FaPaperPlane,
  FaTicket,
} from "react-icons/fa6";
import { getMyBookings } from "../../services/bookingService";
import { getMyTickets, createTicket } from "../../services/supportService";

const CATEGORIES = ["Booking", "Payment", "Equipment", "Technical", "Other"];

const FAQS = [
  {
    question: "How do I rent equipment on RentHub?",
    answer:
      "Browse our equipment catalog, select the items you need, choose your rental dates, and submit a booking request. The equipment owner will review and approve your request shortly.",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "Currently we support Cash on delivery/pickup, UPI bank transfers, and direct net banking payments. Payment details can be configured during checkout.",
  },
  {
    question: "How does the security deposit work?",
    answer:
      "Some equipment owners require a security deposit before handing over the item. This deposit is fully refunded once the equipment is returned in its original condition.",
  },
  {
    question: "What if I return the equipment late?",
    answer:
      "Late returns may incur extra daily rental charges as configured by the equipment owner. If you anticipate a delay, please contact the owner or support immediately.",
  },
  {
    question: "How do I cancel a booking?",
    answer:
      "You can cancel a booking directly from your 'My Bookings' page if it is still 'Pending' or 'Approved' status. Once picked up, cancellation is not possible.",
  },
];

const statusBadgeClasses = {
  Open: "bg-warning-subtle text-warning",
  "In-Progress": "bg-info-subtle text-info",
  Resolved: "bg-success-subtle text-success",
  Closed: "bg-secondary-subtle text-secondary",
};

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

function HelpSupport() {
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // FAQ states
  const [faqSearch, setFaqSearch] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Form states
  const [form, setForm] = useState({
    subject: "",
    category: "Booking",
    bookingId: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Ticket list states
  const [expandedTicket, setExpandedTicket] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError("");
      const [bookingsData, ticketsData] = await Promise.all([
        getMyBookings(),
        getMyTickets(),
      ]);
      setBookings(bookingsData);
      setTickets(ticketsData);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load Help & Support data.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field) => (e) => {
    setForm((current) => ({ ...current, [field]: e.target.value }));
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      setFormError("Subject and message are required.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      await createTicket({
        subject: form.subject,
        category: form.category,
        bookingId: form.bookingId || undefined,
        message: form.message,
      });
      setToast("Support ticket created successfully.");
      setForm({
        subject: "",
        category: "Booking",
        bookingId: "",
        message: "",
      });
      // Refresh tickets
      const updatedTickets = await getMyTickets();
      setTickets(updatedTickets);
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to submit ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFaqs = useMemo(() => {
    const q = faqSearch.toLowerCase().trim();
    if (!q) return FAQS;
    return FAQS.filter(
      (faq) =>
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q)
    );
  }, [faqSearch]);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const toggleTicket = (id) => {
    setExpandedTicket(expandedTicket === id ? null : id);
  };

  return (
    <div className="container-xxl py-4">
      {toast ? <div className="alert alert-success">{toast}</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <BackButton label="Back" />
          <div>
            <p className="text-uppercase small fw-semibold text-primary mb-2">Customer workspace</p>
            <h2 className="fw-bold mb-1">Help & Support</h2>
            <p className="text-muted mb-0">Browse answers or contact support directly for assistance.</p>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Side: FAQ Accordion */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <FaCircleQuestion className="text-primary fs-4" />
              <h4 className="fw-bold mb-0">Frequently Asked Questions</h4>
            </div>

            <div className="input-group mb-4">
              <span className="input-group-text bg-light border-0">
                <FaMagnifyingGlass className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control bg-light border-0"
                placeholder="Search help questions..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
              />
            </div>

            <div className="d-flex flex-column gap-3">
              {filteredFaqs.length === 0 ? (
                <p className="text-muted text-center py-4">No matching questions found.</p>
              ) : (
                filteredFaqs.map((faq, index) => (
                  <div key={index} className="border rounded-4 p-3 bg-light">
                    <button
                      className="btn w-100 text-start d-flex justify-content-between align-items-center p-0 border-0 fw-semibold text-secondary"
                      onClick={() => toggleFaq(index)}
                    >
                      <span>{faq.question}</span>
                      {expandedFaq === index ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                    {expandedFaq === index && (
                      <div className="mt-2 text-muted small pt-2 border-top">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Contact Support Form */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <FaHeadphones className="text-primary fs-4" />
              <h4 className="fw-bold mb-0">Contact Support</h4>
            </div>

            {formError ? <div className="alert alert-danger">{formError}</div> : null}

            <form onSubmit={handleSubmitTicket}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Subject</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Summarize your issue..."
                  value={form.subject}
                  onChange={handleFormChange("subject")}
                  required
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label fw-semibold">Category</label>
                  <select
                    className="form-select"
                    value={form.category}
                    onChange={handleFormChange("category")}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label fw-semibold">Booking (Optional)</label>
                  <select
                    className="form-select"
                    value={form.bookingId}
                    onChange={handleFormChange("bookingId")}
                  >
                    <option value="">Not Related</option>
                    {bookings.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.bookingNumber || b._id.slice(-6)} ({b.equipment?.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Message</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Detail your request or support query..."
                  value={form.message}
                  onChange={handleFormChange("message")}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                <FaPaperPlane className="me-2" />
                {submitting ? "Submitting..." : "Submit Ticket"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Section: My Support Tickets */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mt-4">
        <div className="d-flex align-items-center gap-2 mb-4">
          <FaTicket className="text-primary fs-4" />
          <h4 className="fw-bold mb-0">My Support Tickets</h4>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-5 bg-light rounded-4">
            <div className="fs-1 text-muted mb-2">🎟️</div>
            <h5 className="fw-bold text-secondary mb-1">No Tickets Found</h5>
            <p className="text-muted small mb-0">You have not submitted any support requests yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Category</th>
                  <th>Subject</th>
                  <th>Created At</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <span className="fw-semibold text-primary">{t.ticketId}</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-primary">{t.category}</span>
                    </td>
                    <td className="fw-semibold">{t.subject}</td>
                    <td>{formatDate(t.createdAt)}</td>
                    <td>
                      <span className={`badge ${statusBadgeClasses[t.status] || "bg-light text-dark"}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary rounded-pill px-3"
                        onClick={() => toggleTicket(t._id)}
                      >
                        <FaEnvelope className="me-1" />
                        {expandedTicket === t._id ? "Hide Details" : "View"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Expanded Ticket details view */}
        {expandedTicket && (
          (() => {
            const t = tickets.find((tick) => tick._id === expandedTicket);
            if (!t) return null;
            return (
              <div className="border rounded-4 p-4 mt-3 bg-light">
                <div className="d-flex justify-content-between align-items-start mb-3 border-bottom pb-2">
                  <div>
                    <h5 className="fw-bold mb-1">{t.subject}</h5>
                    <div className="text-muted small">
                      Ticket ID: <span className="text-primary fw-semibold">{t.ticketId}</span> · Submitted on {formatDate(t.createdAt)}
                    </div>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setExpandedTicket(null)} />
                </div>
                <div className="mb-3">
                  <div className="fw-semibold text-secondary mb-1">Your Message:</div>
                  <p className="text-muted mb-0" style={{ whiteSpace: "pre-wrap" }}>
                    {t.message}
                  </p>
                </div>
                {t.bookingId && (
                  <div className="mb-1">
                    <span className="fw-semibold text-secondary">Associated Booking: </span>
                    <span className="text-muted small">
                      {t.bookingId.bookingNumber || t.bookingId._id} (
                      {t.bookingId.equipment?.name || "Equipment"})
                    </span>
                  </div>
                )}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}

export default HelpSupport;
