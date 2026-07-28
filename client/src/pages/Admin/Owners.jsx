import { useEffect, useMemo, useState } from "react";
import { FaBan, FaMagnifyingGlass, FaUserCheck,  } from "react-icons/fa6";
import api from "../../services/api";

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

function Owners() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/users");
      setOwners(response?.data?.data?.filter((u) => u.role === "owner") || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load owners.");
    } finally {
      setLoading(false);
    }
  };

  const filteredOwners = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    let filtered = [...owners];

    if (normalizedSearch) {
      filtered = filtered.filter((user) => {
        const haystack = [user.name, user.email, user.phone]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      });
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((user) => (statusFilter === "Active" ? user.isActive : !user.isActive));
    }

    return filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [owners, search, statusFilter]);

  const handleToggleStatus = async (user) => {
    try {
      setUpdatingId(user._id);
      const response = await api.put(`/admin/users/${user._id}/status`);
      const updatedUser = response?.data?.data || user;
      setOwners((prev) => prev.map((item) => (item._id === user._id ? { ...item, isActive: updatedUser.isActive } : item)));
    } catch (err) {
      alert(err?.response?.data?.message || "Unable to update owner status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = useMemo(() => {
    const total = owners.length;
    const active = owners.filter((u) => u.isActive).length;
    const inactive = total - active;
    return [
      { title: "Owners", value: total, subtitle: "All owners", color: "success" },
      { title: "Active", value: active, subtitle: "Active accounts", color: "success" },
      { title: "Inactive", value: inactive, subtitle: "Blocked accounts", color: "danger" },
    ];
  }, [owners]);

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <p className="text-uppercase small fw-semibold text-primary mb-2">Admin workspace</p>
          <h2 className="fw-bold mb-1">Owners</h2>
          <p className="text-muted mb-0">Manage equipment owner accounts across the platform.</p>
        </div>
        <button className="btn btn-primary" onClick={fetchOwners}>
          Refresh
        </button>
      </div>

      <div className="row g-4 mb-4">
        {stats.map((card) => (
          <div className="col-12 col-md-6 col-xl-2" key={card.title}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-muted mb-1">{card.title}</h6>
                    <h3 className={`text-${card.color} fw-bold mb-0`}>{card.value}</h3>
                  </div>
                  <span className={`badge bg-${card.color}-subtle text-${card.color}`}>{card.subtitle}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
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
                  placeholder="Search by name, email, phone"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-2">
              <label className="form-label fw-semibold">Status</label>
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="col-12 col-lg-2 text-lg-end">
              <div className="text-muted small mb-1">Results</div>
              <div className="fw-bold fs-5">{filteredOwners.length}</div>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading owners...</p>
        </div>
      ) : filteredOwners.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <FaUserCheck className="fs-1 text-muted mb-3 mx-auto" />
          <h4 className="fw-semibold mb-2">No owners found</h4>
          <p className="text-muted mb-0">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="table-responsive card border-0 shadow-sm rounded-4 overflow-hidden">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Owner</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOwners.map((owner) => (
                <tr key={owner._id}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                        {(owner.name || "O").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-semibold">{owner.name || "—"}</div>
                        {owner.businessName && <div className="text-muted small">{owner.businessName}</div>}
                      </div>
                    </div>
                  </td>
                  <td>{owner.email || "—"}</td>
                  <td>{owner.phone || "—"}</td>
                  <td>
                    <span className={`badge ${owner.isActive ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
                      {owner.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{formatDate(owner.createdAt)}</td>
                  <td>
                    <div className="d-flex justify-content-end">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        type="button"
                        onClick={() => handleToggleStatus(owner)}
                        disabled={updatingId === owner._id}
                      >
                        {updatingId === owner._id ? "Updating..." : owner.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Owners;