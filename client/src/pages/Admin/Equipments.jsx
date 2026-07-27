import { useEffect, useMemo, useState } from "react";
import { FaBoxOpen, FaEdit, FaEye, FaMagnifyingGlass, FaStar, FaTrash, FaUpload } from "react-icons/fa6";
import { Link } from "react-router-dom";
import api from "../../services/api";

const imageBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const placeholderImage = "https://via.placeholder.com/800x520?text=No+Image";

const getImageUrl = (equipment) => {
  const image = equipment?.images?.[0];
  if (!image) return placeholderImage;
  if (/^https?:\/\//i.test(image)) return image;
  return `${imageBaseUrl}/uploads/${image}`;
};

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

const statusClasses = {
  Available: "bg-success-subtle text-success",
  Rented: "bg-info-subtle text-info",
  Maintenance: "bg-warning-subtle text-warning",
  Unavailable: "bg-secondary-subtle text-secondary",
};

function Equipments() {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [availability, setAvailability] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchEquipments();
  }, []);

  const fetchEquipments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/equipment");
      setEquipments(response?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load equipment list.");
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const values = [...new Set(equipments.map((item) => item.category).filter(Boolean))];
    return ["All", ...values.sort()];
  }, [equipments]);

  const filteredEquipments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    let filtered = [...equipments];

    if (normalizedSearch) {
      filtered = filtered.filter((item) => {
        const haystack = [item.name, item.brand, item.category, item.location, item.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      });
    }

    if (category !== "All") {
      filtered = filtered.filter((item) => item.category === category);
    }

    if (availability !== "All") {
      filtered = filtered.filter((item) =>
        availability === "Available"
          ? item.available === true || item.status === "Available"
          : item.available === false || item.status !== "Available"
      );
    }

    if (sortBy === "price-asc") {
      filtered = filtered.sort((a, b) => (a.pricePerDay || 0) - (b.pricePerDay || 0));
    } else if (sortBy === "price-desc") {
      filtered = filtered.sort((a, b) => (b.pricePerDay || 0) - (a.pricePerDay || 0));
    } else if (sortBy === "rating") {
      filtered = filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else {
      filtered = filtered.sort(
        (a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0)
      );
    }

    return filtered;
  }, [equipments, search, category, availability, sortBy]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/equipment/${deleteTarget._id}`);
      setEquipments((prev) => prev.filter((item) => item._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to delete equipment.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <p className="text-uppercase small fw-semibold text-primary mb-2">Admin workspace</p>
          <h2 className="fw-bold mb-1">All Equipment</h2>
          <p className="text-muted mb-0">Review and manage every equipment listing across the platform.</p>
        </div>
        <Link to="/admin/equipments" className="btn btn-primary">
          <FaUpload className="me-2" />
          Refresh
        </Link>
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
                  placeholder="Search equipment by name, brand, category"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-2">
              <label className="form-label fw-semibold">Category</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-6 col-lg-2">
              <label className="form-label fw-semibold">Availability</label>
              <select className="form-select" value={availability} onChange={(e) => setAvailability(e.target.value)}>
                <option value="All">All</option>
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>
            <div className="col-12 col-md-6 col-lg-2">
              <label className="form-label fw-semibold">Sort by</label>
              <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="latest">Latest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
            <div className="col-12 col-lg-2 text-lg-end">
              <div className="text-muted small mb-1">Results</div>
              <div className="fw-bold fs-5">{filteredEquipments.length}</div>
            </div>
          </div>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading equipment list...</p>
        </div>
      ) : filteredEquipments.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <FaBoxOpen className="fs-1 text-muted mb-3 mx-auto" />
          <h4 className="fw-semibold mb-2">No equipment found</h4>
          <p className="text-muted mb-0">Try adjusting the search or filter criteria.</p>
        </div>
      ) : (
        <div className="table-responsive card border-0 shadow-sm rounded-4 overflow-hidden">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Equipment</th>
                <th>Owner</th>
                <th>Category</th>
                <th>Price/Day</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Created</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipments.map((equipment) => (
                <tr key={equipment._id}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={getImageUrl(equipment)}
                        alt={equipment.name}
                        className="rounded-3"
                        style={{ width: "60px", height: "60px", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.src = placeholderImage;
                        }}
                      />
                      <div>
                        <div className="fw-semibold">{equipment.name}</div>
                        <div className="text-muted small">{equipment.brand || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="fw-semibold">{equipment.owner?.name || "—"}</div>
                    <div className="text-muted small">{equipment.owner?.email || "—"}</div>
                  </td>
                  <td>{equipment.category || "—"}</td>
                  <td>{formatCurrency(equipment.pricePerDay)}</td>
                  <td>
                    <span className={`badge ${statusClasses[equipment.status] || "bg-light text-dark"}`}>
                      {equipment.status || (equipment.available ? "Available" : "Unavailable")}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-1">
                      <FaStar className="text-warning" />
                      {(equipment.averageRating || 0).toFixed(1)}
                    </div>
                  </td>
                  <td>{formatDate(equipment.createdAt)}</td>
                  <td>
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        type="button"
                        onClick={() => setSelectedEquipment(equipment)}
                      >
                        <FaEye />
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        type="button"
                        onClick={() => setDeleteTarget(equipment)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedEquipment ? (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content rounded-4 border-0">
              <div className="modal-header">
                <h5 className="modal-title">Equipment Details</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedEquipment(null)} />
              </div>
              <div className="modal-body">
                <div className="row g-4">
                  <div className="col-12 col-md-5">
                    <img
                      src={getImageUrl(selectedEquipment)}
                      alt={selectedEquipment.name}
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
                        <div className="text-muted small">Equipment</div>
                        <div className="fw-semibold">{selectedEquipment.name}</div>
                        <div className="text-muted small">
                          {selectedEquipment.brand || "—"} · {selectedEquipment.category || "—"}
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Price / day</div>
                          <div className="fw-semibold">{formatCurrency(selectedEquipment.pricePerDay)}</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Deposit</div>
                          <div className="fw-semibold">{formatCurrency(selectedEquipment.deposit)}</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Status</div>
                          <div className="fw-semibold">{selectedEquipment.status || "Available"}</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Rating</div>
                          <div className="fw-semibold">{(selectedEquipment.averageRating || 0).toFixed(1)}/5</div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Location</div>
                          <div className="fw-semibold">{selectedEquipment.location || "—"}</div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small">Owner</div>
                          <div className="fw-semibold">{selectedEquipment.owner?.name || "—"}</div>
                          <div className="text-muted small">{selectedEquipment.owner?.email || "—"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" type="button" onClick={() => setSelectedEquipment(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content rounded-4 border-0">
              <div className="modal-header">
                <h5 className="modal-title">Delete Equipment</h5>
                <button type="button" className="btn-close" onClick={() => setDeleteTarget(null)} />
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" type="button" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger" type="button" onClick={handleDelete} disabled={deleting}>
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

export default Equipments;
