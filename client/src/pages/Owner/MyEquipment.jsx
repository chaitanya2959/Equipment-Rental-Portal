import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import EquipmentCard from "../../components/cards/EquipmentCard";

const PAGE_SIZE = 6;

function MyEquipment() {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [availability, setAvailability] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchEquipment();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, category, availability, sort]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/equipment/my-equipment");
      setEquipments(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load your equipment right now.");
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const values = [...new Set(equipments.map((item) => item.category).filter(Boolean))];
    return values.sort();
  }, [equipments]);

  const filteredEquipments = useMemo(() => {
    let list = [...equipments];

    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter((item) => item.name?.toLowerCase().includes(term));
    }

    if (category) {
      list = list.filter((item) => item.category === category);
    }

    if (availability) {
      const isAvailable = availability === "available";
      list = list.filter((item) => Boolean(item.available) === isAvailable);
    }

    if (sort === "asc") {
      list.sort((a, b) => Number(a.pricePerDay || 0) - Number(b.pricePerDay || 0));
    } else if (sort === "desc") {
      list.sort((a, b) => Number(b.pricePerDay || 0) - Number(a.pricePerDay || 0));
    }

    return list;
  }, [equipments, search, category, availability, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredEquipments.length / PAGE_SIZE));
  const visibleEquipments = filteredEquipments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openDeleteModal = (equipment) => {
    setDeleteTarget(equipment);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await API.delete(`/equipment/${deleteTarget._id}`);
      setEquipments((prev) => prev.filter((item) => item._id !== deleteTarget._id));
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to delete this equipment.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">My Equipment</h2>
          <p className="text-muted mb-0">Manage your rental inventory with a modern owner dashboard view.</p>
        </div>
        <Link to="/owner/equipment/new" className="btn btn-primary">
          + Add Equipment
        </Link>
      </div>

      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <form className="row g-3" onSubmit={(e) => e.preventDefault()}>
            <div className="col-12 col-lg-4">
              <label className="form-label visually-hidden">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search equipment"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-2">
              <label className="form-label visually-hidden">Category</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6 col-lg-2">
              <label className="form-label visually-hidden">Availability</label>
              <select className="form-select" value={availability} onChange={(e) => setAvailability(e.target.value)}>
                <option value="">All Availability</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            <div className="col-12 col-md-6 col-lg-2">
              <label className="form-label visually-hidden">Sort</label>
              <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="">Price Sort</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
            </div>

            <div className="col-12 col-md-6 col-lg-2">
              <button type="button" className="btn btn-dark w-100" onClick={() => setPage(1)}>
                Apply Filters
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <p className="text-muted mb-0">
          Showing <strong>{visibleEquipments.length}</strong> of <strong>{filteredEquipments.length}</strong> items
        </p>
        <span className="badge bg-light text-dark">{equipments.length} total</span>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading your equipment...</p>
        </div>
      ) : visibleEquipments.length === 0 ? (
        <div className="text-center py-5 border rounded-4 bg-light">
          <h5 className="mb-2">No equipment found</h5>
          <p className="text-muted mb-3">Try a different search or add a new item.</p>
          <Link to="/owner/equipment/new" className="btn btn-primary">
            Add Equipment
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {visibleEquipments.map((equipment) => (
            <EquipmentCard key={equipment._id} equipment={equipment} onDelete={openDeleteModal} />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <nav className="mt-4" aria-label="Equipment pagination">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, index) => (
              <li key={index + 1} className={`page-item ${page === index + 1 ? "active" : ""}`}>
                <button className="page-link" onClick={() => setPage(index + 1)}>
                  {index + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
                Next
              </button>
            </li>
          </ul>
        </nav>
      ) : null}

      {showDeleteModal && deleteTarget ? (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Equipment</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)} />
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default MyEquipment;