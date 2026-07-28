import { useEffect, useMemo, useState } from "react";
import { FaPhone, FaRotateRight, FaMagnifyingGlass,FaArrowsRotate, FaTruck, FaUser } from "react-icons/fa6";
import API from "../../services/api";

const imageBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const placeholderImage = "https://via.placeholder.com/400x220?text=No+Image";

const getImageUrl = (equipment) => {
  const image = equipment?.images?.[0];
  if (!image) return placeholderImage;
  if (/^https?:\/\//i.test(image)) return image;
  return `${imageBaseUrl}/uploads/${image}`;
};

const statusOptions = ["All", "Approved", "PickedUp", "Completed", "Cancelled", "Rejected"];

function CurrentRentals() {
  const [rentals, setRentals] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/booking/owner");
      setRentals(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load current rentals.");
    } finally {
      setLoading(false);
    }
  };

  const filteredRentals = useMemo(() => {
    const normalizedSearch = search.toLowerCase();

    const filtered = rentals.filter((rental) => {
      const matchesStatus = statusFilter === "All" || rental.status === statusFilter;
      const matchesSearch =
        (rental.equipment?.name || "").toLowerCase().includes(normalizedSearch) ||
        (rental.customer?.name || "").toLowerCase().includes(normalizedSearch) ||
        (rental.customer?.phone || "").toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.startDate || a.createdAt || 0);
      const dateB = new Date(b.startDate || b.createdAt || 0);
      return sortBy === "oldest" ? dateA - dateB : dateB - dateA;
    });
  }, [rentals, search, statusFilter, sortBy]);

  const summaryCards = useMemo(() => {
    const active = rentals.filter((item) => item.status === "PickedUp").length;
    const pickupsToday = rentals.filter((item) => {
      const pickup = item.pickupDate || item.createdAt;
      if (!pickup) return false;
      const date = new Date(pickup);
      const today = new Date();
      return date.toDateString() === today.toDateString();
    }).length;

    const returnsToday = rentals.filter((item) => {
      const ret = item.returnDate || item.updatedAt;
      if (!ret) return false;
      const date = new Date(ret);
      const today = new Date();
      return date.toDateString() === today.toDateString();
    }).length;

    const income = rentals.reduce((sum, item) => {
      const isPaid = item.paymentStatus === "Paid";
      return isPaid ? sum + Number(item.totalAmount || 0) : sum;
    }, 0);

    return [
      { title: "Active Rentals", value: active, subtitle: "Currently on hand", color: "primary" },
      { title: "Today's Pickups", value: pickupsToday, subtitle: "Scheduled today", color: "success" },
      { title: "Today's Returns", value: returnsToday, subtitle: "Expected today", color: "warning" },
      { title: "Total Rental Income", value: `₹${income.toLocaleString("en-IN")}`, subtitle: "Collected so far", color: "info" },
    ];
  }, [rentals]);

  const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const badgeClass = (status) => {
    const classes = {
      Approved: "bg-info-subtle text-info",
      PickedUp: "bg-primary-subtle text-primary",
      Completed: "bg-success-subtle text-success",
      Cancelled: "bg-secondary-subtle text-secondary",
      Rejected: "bg-danger-subtle text-danger",
    };

    return classes[status] || "bg-light text-dark";
  };

  const paymentBadgeClass = (status) => {
    const classes = {
      Paid: "bg-success-subtle text-success",
      Pending: "bg-warning-subtle text-warning",
      Failed: "bg-danger-subtle text-danger",
      Refunded: "bg-secondary-subtle text-secondary",
    };

    return classes[status] || "bg-light text-dark";
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 mb-4">
        <div>
          <p className="text-uppercase small fw-semibold text-primary mb-2">Owner panel</p>
          <h2 className="fw-bold mb-1">Current Rentals</h2>
          <p className="text-muted mb-0">Monitor active hires, customer contact details, and rental progress in one place.</p>
        </div>
        <button className="btn btn-outline-primary" onClick={fetchRentals}>
          <FaArrowsRotate className="me-2" /> Refresh
        </button>
      </div>

      <div className="row g-4 mb-4">
        {summaryCards.map((card) => (
          <div className="col-12 col-md-6 col-xl-3" key={card.title}>
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-2">{card.title}</h6>
                    <h3 className={`text-${card.color} fw-bold mb-0`}>{card.value}</h3>
                  </div>
                  <span className={`badge bg-${card.color}-subtle text-${card.color}`}>{card.subtitle}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-5">
            <label className="form-label fw-semibold">Search Rental</label>
            <div className="position-relative">
              <FaMagnifyingGlass className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input
                className="form-control ps-5"
                placeholder="Search equipment or customer"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label fw-semibold">Filter by Status</label>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-2">
            <label className="form-label fw-semibold">Sort by Date</label>
            <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
          <div className="col-12 col-md-2">
            <button className="btn btn-primary w-100" onClick={fetchRentals}>
              <FaRotateRight className="me-2" /> Refresh
            </button>
          </div>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading rentals...</p>
        </div>
      ) : filteredRentals.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <h4 className="fw-semibold mb-2">No matching rentals</h4>
          <p className="text-muted mb-0">Try changing the search or filter criteria.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredRentals.map((rental) => (
            <div key={rental._id} className="col-12 col-md-6 col-xl-4">
              <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                <img
                  src={getImageUrl(rental.equipment)}
                  alt={rental.equipment?.name || "Equipment"}
                  className="img-fluid w-100"
                  style={{ height: "220px", objectFit: "cover" }}
                />

                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                    <div>
                      <h5 className="fw-bold mb-1">{rental.equipment?.name || "Equipment"}</h5>
                      <div className="text-muted small">{rental.equipment?.category || "Uncategorized"}</div>
                    </div>
                    <span className={`badge ${badgeClass(rental.status)}`}>{rental.status}</span>
                  </div>

                  <div className="border rounded-4 p-3 mb-3 bg-light">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <FaUser className="text-primary" />
                      <span className="fw-semibold">{rental.customer?.name || "Customer"}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2 text-muted small">
                      <FaPhone />
                      <span>{rental.customer?.phone || "Phone not provided"}</span>
                    </div>
                  </div>

                  <div className="row g-2 small mb-3">
                    <div className="col-6">
                      <div className="border rounded-3 p-2">
                        <div className="text-muted">Start</div>
                        <div className="fw-semibold">{formatDate(rental.startDate)}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="border rounded-3 p-2">
                        <div className="text-muted">Return</div>
                        <div className="fw-semibold">{formatDate(rental.returnDate || rental.endDate)}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="border rounded-3 p-2">
                        <div className="text-muted">Days</div>
                        <div className="fw-semibold">{rental.totalDays || 0}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="border rounded-3 p-2">
                        <div className="text-muted">Amount</div>
                        <div className="fw-semibold">₹{rental.totalAmount || 0}</div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className={`badge ${paymentBadgeClass(rental.paymentStatus)}`}>{rental.paymentStatus || "Pending"}</span>
                    <span className="badge bg-light text-dark">{rental.status}</span>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    <button className="btn btn-outline-primary btn-sm flex-fill">View Details</button>
                    <button className="btn btn-success btn-sm flex-fill">
                      <FaTruck className="me-1" /> Mark as Returned
                    </button>
                    <button className="btn btn-outline-secondary btn-sm flex-fill">
                      <FaPhone className="me-1" /> Contact
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CurrentRentals;
