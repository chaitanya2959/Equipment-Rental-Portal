import { useEffect, useMemo, useState } from "react";
import { FaBan, FaCheck, FaMagnifyingGlass, FaShield, FaUser, FaUserCheck, FaUserX } from "react-icons/fa6";
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

const roleClasses = {
  admin: "bg-danger-subtle text-danger",
  owner: "bg-success-subtle text-success",
  customer: "bg-info-subtle text-info",
};

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/users");
      setUsers(response?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load users list.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    let filtered = [...users];

    if (normalizedSearch) {
      filtered = filtered.filter((user) => {
        const haystack = [user.name, user.email, user.phone, user.role]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      });
    }

    if (roleFilter !== "All") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((user) =>
        statusFilter === "Active" ? user.isActive : !user.isActive
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  }, [users, search, roleFilter, statusFilter]);

  const handleToggleStatus = async (user) => {
    try {
      setUpdatingId(user._id);
      const response = await api.put(`/admin/users/${user._id}/status`);
      const updatedUser = response?.data?.data || user;
      setUsers((prev) =>
        prev.map((item) => (item._id === user._id ? { ...item, isActive: updatedUser.isActive } : item))
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update user status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const inactive = total - active;
    const customers = users.filter((u) => u.role === "customer").length;
    const owners = users.filter((u) => u.role === "owner").length;
    const admins = users.filter((u) => u.role === "admin").length;

    return [
      { title: "Total Users", value: total, subtitle: "All accounts", color: "primary" },
      { title: "Active", value: active, subtitle: "Currently active", color: "success" },
      { title: "Inactive", value: inactive, subtitle: "Blocked accounts", color: "danger" },
      { title: "Customers", value: customers, subtitle: "Customer role", color: "info" },
      { title: "Owners", value: owners, subtitle: "Owner role", color: "warning" },
      { title: "Admins", value: admins, subtitle: "Admin role", color: "dark" },
    ];
  }, [users]);

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <p className="text-uppercase small fw-semibold text-primary mb-2">Admin workspace</p>
          <h2 className="fw-bold mb-1">All Users</h2>
          <p className="text-muted mb-0">Manage user accounts, roles, and activation status.</p>
        </div>
        <button className="btn btn-primary" onClick={fetchUsers}>
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
                  <span className={`badge bg-${card.color}-subtle text-${card.color}`}>
                    {card.subtitle}
                  </span>
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
                  placeholder="Search by name, email, phone, role"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-2">
              <label className="form-label fw-semibold">Role</label>
              <select className="form-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="All">All Roles</option>
                <option value="customer">Customer</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="col-12 col-md-6 col-lg-2">
              <label className="form-label fw-semibold">Status</label>
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="col-12 col-lg-2 text-lg-end">
              <div className="text-muted small mb-1">Results</div>
              <div className="fw-bold fs-5">{filteredUsers.length}</div>
            </div>
          </div>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading users list...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <FaUser className="fs-1 text-muted mb-3 mx-auto" />
          <h4 className="fw-semibold mb-2">No users found</h4>
          <p className="text-muted mb-0">Try adjusting the search or filter criteria.</p>
        </div>
      ) : (
        <div className="table-responsive card border-0 shadow-sm rounded-4 overflow-hidden">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Created</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                        {user.name?.charAt(0)?.toUpperCase() || <FaUser />}
                      </div>
                      <div>
                        <div className="fw-semibold">{user.name || "—"}</div>
                        {user.businessName ? <div className="text-muted small">{user.businessName}</div> : null}
                      </div>
                    </div>
                  </td>
                  <td>{user.email || "—"}</td>
                  <td>{user.phone || "—"}</td>
                  <td>
                    <span className={`badge ${roleClasses[user.role] || "bg-light text-dark"}`}>
                      {user.role || "customer"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.isActive ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    {user.isVerified ? (
                      <FaCheck className="text-success" />
                    ) : (
                      <FaBan className="text-muted" />
                    )}
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="d-flex justify-content-end">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        type="button"
                        onClick={() => handleToggleStatus(user)}
                        disabled={updatingId === user._id}
                      >
                        {updatingId === user._id
                          ? "Updating..."
                          : user.isActive
                            ? "Deactivate"
                            : "Activate"}
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

export default Users;
