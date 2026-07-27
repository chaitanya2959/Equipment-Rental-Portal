import { useEffect, useMemo, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaEye,
  FaMagnifyingGlass,
  FaRegCalendarDays,
  FaRegFileLines,
} from "react-icons/fa6";
import API from "../../services/api";

const PAGE_SIZE = 6;

function RentalHistory() {
  const [rentals, setRentals] = useState([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRental, setSelectedRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRentals();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, fromDate, toDate, category, sortBy]);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/booking/owner");
      setRentals((res?.data?.data || []).filter((booking) => booking.status === "Completed"));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load rental history.");
    } finally {
      setLoading(false);
    }
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

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const imageBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
  const placeholderImage = "https://via.placeholder.com/640x420?text=No+Image";

  const completedDate = (booking) => new Date(booking.returnDate || booking.updatedAt || booking.endDate || booking.createdAt || 0);

  const categories = useMemo(() => {
    const unique = new Set();
    rentals.forEach((booking) => {
      if (booking.equipment?.category) unique.add(booking.equipment.category);
    });
    return ["All", ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [rentals]);

  const filteredRentals = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (to) to.setHours(23, 59, 59, 999);

    const filtered = rentals.filter((booking) => {
      const searchTarget = [
        booking.bookingNumber,
        booking.equipment?.name,
        booking.equipment?.brand,
        booking.equipment?.category,
        booking.customer?.name,
        booking.customer?.email,
        booking.customer?.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const bookingDate = completedDate(booking);
      const matchesSearch = !normalizedSearch || searchTarget.includes(normalizedSearch);
      const matchesCategory = category === "All" || booking.equipment?.category === category;
      const matchesFrom = !from || bookingDate >= from;
      const matchesTo = !to || bookingDate <= to;

      return matchesSearch && matchesCategory && matchesFrom && matchesTo;
    });

    filtered.sort((a, b) => {
      const dateA = completedDate(a).getTime();
      const dateB = completedDate(b).getTime();
      return sortBy === "oldest" ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  }, [rentals, search, fromDate, toDate, category, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredRentals.length / PAGE_SIZE));

  const paginatedRentals = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRentals.slice(start, start + PAGE_SIZE);
  }, [filteredRentals, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const summary = useMemo(() => {
    const totalRevenue = filteredRentals.reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0);
    const paidRevenue = filteredRentals
      .filter((booking) => booking.paymentStatus === "Paid")
      .reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0);
    const avgValue = filteredRentals.length ? totalRevenue / filteredRentals.length : 0;
    const depositTotal = filteredRentals.reduce((sum, booking) => sum + Number(booking.depositAmount || 0), 0);

    return [
      { title: "Completed Rentals", value: filteredRentals.length, subtitle: "Matching results", color: "primary" },
      { title: "Total Revenue", value: formatCurrency(totalRevenue), subtitle: "Completed bookings", color: "success" },
      { title: "Paid Revenue", value: formatCurrency(paidRevenue), subtitle: "Collected amount", color: "warning" },
      { title: "Avg. Booking", value: formatCurrency(avgValue), subtitle: "Per rental", color: "info" },
      { title: "Deposits", value: formatCurrency(depositTotal), subtitle: "Deposit total", color: "dark" },
    ];
  }, [filteredRentals]);

  const exportHistory = () => {
    if (!filteredRentals.length) return;

    const headers = [
      "Booking No",
      "Equipment",
      "Customer",
      "Category",
      "Rental Date",
      "Return Date",
      "Total Days",
      "Total Amount",
      "Payment Status",
      "Booking Status",
    ];

    const rows = filteredRentals.map((booking) => [
      booking.bookingNumber || booking._id,
      booking.equipment?.name || "",
      booking.customer?.name || "",
      booking.equipment?.category || "",
      formatDate(booking.startDate),
      formatDate(booking.returnDate || booking.endDate),
      booking.totalDays || 0,
      Number(booking.totalAmount || 0),
      booking.paymentStatus || "Pending",
      booking.status || "Completed",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rental-history-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const completedLabel = (booking) => formatDate(booking.returnDate || booking.updatedAt || booking.endDate || booking.createdAt);

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <p className="text-uppercase small fw-semibold text-primary mb-2">Owner panel</p>
          <h2 className="fw-bold mb-1">Rental History</h2>
          <p className="text-muted mb-0">Review completed rentals, track revenue, and export history when needed.</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-outline-secondary" onClick={fetchRentals} type="button">
            <FaRegCalendarDays className="me-2" />
            Refresh
          </button>
          <button className="btn btn-primary" onClick={exportHistory} disabled={!filteredRentals.length} type="button">
            <FaDownload className="me-2" />
            Export History
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-lg-4">
              <label className="form-label fw-semibold">Search</label>
              <div className="position-relative">
                <FaMagnifyingGlass className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  className="form-control ps-5"
                  placeholder="Search equipment, customer, booking number"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-2">
              <label className="form-label fw-semibold">Date From</label>
              <input className="form-control" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="col-12 col-md-6 col-lg-2">
              <label className="form-label fw-semibold">Date To</label>
              <input className="form-control" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
            <div className="col-12 col-md-6 col-lg-2">
              <label className="form-label fw-semibold">Category</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-6 col-lg-2">
              <label className="form-label fw-semibold">Sort By</label>
              <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {summary.map((card) => (
          <div className="col-12 col-md-6 col-xl-4" key={card.title}>
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

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading rental history...</p>
        </div>
      ) : filteredRentals.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <FaRegFileLines className="fs-1 text-muted mb-3 mx-auto" />
          <h4 className="fw-semibold mb-2">No completed rentals found</h4>
          <p className="text-muted mb-0">Try changing the search, date, or category filters.</p>
        </div>
      ) : (
        <>
          <div className="row g-4">
            {paginatedRentals.map((booking) => {
              const image = booking.equipment?.images?.[0]
                ? `${imageBaseUrl}/uploads/${booking.equipment.images[0]}`
                : placeholderImage;

              return (
                <div className="col-12 col-md-6 col-xl-4" key={booking._id}>
                  <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                    <img
                      src={image}
                      alt={booking.equipment?.name || "Equipment"}
                      className="img-fluid w-100"
                      style={{ height: "220px", objectFit: "cover" }}
                      onError={(e) => {
                        e.currentTarget.src = placeholderImage;
                      }}
                    />
                    <div className="card-body p-4 d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                        <div>
                          <h5 className="fw-bold mb-1">{booking.equipment?.name || "Equipment"}</h5>
                          <div className="text-muted small">{booking.equipment?.category || "Uncategorized"}</div>
                        </div>
                        <span className="badge bg-success-subtle text-success">Completed</span>
                      </div>

                      <div className="border rounded-4 p-3 bg-light mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted small">Customer</span>
                          <strong className="small">{booking.customer?.name || "Customer"}</strong>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted small">Rental Date</span>
                          <strong className="small">{formatDate(booking.startDate)}</strong>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted small">Return Date</span>
                          <strong className="small">{formatDate(booking.returnDate || booking.endDate)}</strong>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted small">Total Days</span>
                          <strong className="small">{booking.totalDays || 0}</strong>
                        </div>
                      </div>

                      <div className="row g-2 mb-3 small">
                        <div className="col-6">
                          <div className="border rounded-3 p-2 h-100">
                            <div className="text-muted">Amount</div>
                            <div className="fw-semibold">{formatCurrency(booking.totalAmount)}</div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="border rounded-3 p-2 h-100">
                            <div className="text-muted">Payment</div>
                            <div className="fw-semibold">{booking.paymentStatus || "Pending"}</div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="border rounded-3 p-2 h-100">
                            <div className="text-muted">Booking</div>
                            <div className="fw-semibold">{booking.status || "Completed"}</div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="border rounded-3 p-2 h-100">
                            <div className="text-muted">Completed On</div>
                            <div className="fw-semibold">{completedLabel(booking)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto d-flex gap-2">
                        <button className="btn btn-outline-primary btn-sm flex-fill" onClick={() => setSelectedRental(booking)} type="button">
                          <FaEye className="me-1" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mt-4">
            <div className="text-muted">
              Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredRentals.length)}-
              {Math.min(currentPage * PAGE_SIZE, filteredRentals.length)} of {filteredRentals.length} rentals
            </div>
            <nav aria-label="Rental history pagination">
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
                    <FaChevronLeft />
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <li key={page} className={`page-item ${page === currentPage ? "active" : ""}`}>
                    <button className="page-link" type="button" onClick={() => setCurrentPage(page)}>
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>
                    <FaChevronRight />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </>
      )}

      {selectedRental ? (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content rounded-4 border-0">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title mb-1">Rental Details</h5>
                  <div className="text-muted small">{selectedRental.bookingNumber || selectedRental._id}</div>
                </div>
                <button type="button" className="btn-close" onClick={() => setSelectedRental(null)} />
              </div>
              <div className="modal-body">
                <div className="row g-4">
                  <div className="col-12 col-md-5">
                    <img
                      src={
                        selectedRental.equipment?.images?.[0]
                          ? `${imageBaseUrl}/uploads/${selectedRental.equipment.images[0]}`
                          : placeholderImage
                      }
                      alt={selectedRental.equipment?.name || "Equipment"}
                      className="img-fluid rounded-4 w-100"
                      style={{ height: "240px", objectFit: "cover" }}
                      onError={(e) => {
                        e.currentTarget.src = placeholderImage;
                      }}
                    />
                  </div>
                  <div className="col-12 col-md-7">
                    <div className="row g-3">
                      <div className="col-12">
                        <div className="border rounded-4 p-3">
                          <div className="text-muted small">Equipment</div>
                          <div className="fw-semibold">{selectedRental.equipment?.name || "—"}</div>
                          <div className="small text-muted">
                            {selectedRental.equipment?.brand || "—"} | {selectedRental.equipment?.category || "—"}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Customer</div>
                          <div className="fw-semibold">{selectedRental.customer?.name || "—"}</div>
                          <div className="small text-muted">{selectedRental.customer?.email || "—"}</div>
                          <div className="small text-muted">{selectedRental.customer?.phone || "—"}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Rental Period</div>
                          <div className="fw-semibold">{formatDate(selectedRental.startDate)}</div>
                          <div className="small text-muted">to {formatDate(selectedRental.returnDate || selectedRental.endDate)}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-4">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Total Days</div>
                          <div className="fw-semibold">{selectedRental.totalDays || 0}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-4">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Amount</div>
                          <div className="fw-semibold">{formatCurrency(selectedRental.totalAmount)}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-4">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Deposit</div>
                          <div className="fw-semibold">{formatCurrency(selectedRental.depositAmount)}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Payment Status</div>
                          <div className="fw-semibold">{selectedRental.paymentStatus || "Pending"}</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Booking Status</div>
                          <div className="fw-semibold">{selectedRental.status || "Completed"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setSelectedRental(null)} type="button">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default RentalHistory;
