import { useEffect, useMemo, useState } from "react";
import { FaPenToSquare, FaFolderOpen, FaMagnifyingGlass, FaPlus, FaTrash } from "react-icons/fa6";
import api from "../../services/api";

const statusClass = (status) => {
  const classes = {
    Available: "bg-success-subtle text-success",
    Rented: "bg-info-subtle text-info",
    Maintenance: "bg-warning-subtle text-warning",
    Unavailable: "bg-secondary-subtle text-secondary",
  };
  return classes[status] || "bg-light text-dark";
};

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", image: null });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/categories");
      setCategories(response?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load categories.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    let filtered = [...categories];

    if (normalizedSearch) {
      filtered = filtered.filter((c) => {
        const haystack = [c.name, c.description].filter(Boolean).join(" ").toLowerCase();
        return haystack.includes(normalizedSearch);
      });
    }

    return filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [categories, search]);

  const resetForm = () => {
    setForm({ name: "", description: "", image: null });
    setSelectedCategory(null);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setForm({
      name: category.name || "",
      description: category.description || "",
      image: category.image || null,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    try {
      setSaving(true);
      const data = new FormData();
      data.append("name", form.name.trim());
      data.append("description", form.description.trim());
      if (form.image && typeof form.image === "string") {
        data.append("keepImages", "true");
      }
      if (form.image instanceof File) {
        data.append("image", form.image);
      }

      let response;
      if (selectedCategory) {
        response = await api.put(`/categories/${selectedCategory._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post("/categories", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await fetchCategories();
      resetForm();
    } catch (err) {
      alert(err?.response?.data?.message || "Unable to save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/categories/${deleteTarget._id}`);
      setCategories((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Unable to delete category.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <p className="text-uppercase small fw-semibold text-primary mb-2">Admin workspace</p>
          <h2 className="fw-bold mb-1">Categories</h2>
          <p className="text-muted mb-0">Manage equipment categories across the platform.</p>
        </div>
        <button className="btn btn-primary" onClick={resetForm}>
          <FaPlus className="me-1" /> Add Category
        </button>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-0">
              <h5 className="mb-0">{selectedCategory ? "Edit Category" : "Create Category"}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSave}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Name</label>
                  <input
                    className="form-control"
                    placeholder="Category name"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    className="form-control"
                    placeholder="Short description"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Image</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setForm((prev) => ({ ...prev, image: file }));
                    }}
                  />
                  {form.image && typeof form.image === "string" && (
                    <img
                      src={form.image}
                      alt=""
                      className="mt-2 rounded-3"
                      style={{ width: "80px", height: "80px", objectFit: "cover" }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-primary" type="submit" disabled={saving}>
                    {saving ? "Saving..." : selectedCategory ? "Update" : "Create"}
                  </button>
                  {selectedCategory && (
                    <button className="btn btn-outline-secondary" type="button" onClick={resetForm}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
              <div className="row g-3 align-items-end">
                <div className="col-12 col-lg-4">
                  <label className="form-label fw-semibold">Search</label>
                  <div className="position-relative">
                    <FaMagnifyingGlass className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                    <input
                      className="form-control ps-5"
                      placeholder="Search categories..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-12 col-lg-2 text-lg-end">
                  <div className="text-muted small mb-1">Results</div>
                  <div className="fw-bold fs-5">{filteredCategories.length}</div>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-3 text-muted">Loading categories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
              <FaFolderOpen className="fs-1 text-muted mb-3 mx-auto" />
              <h4 className="fw-semibold mb-2">No categories found</h4>
              <p className="text-muted mb-0">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="table-responsive card border-0 shadow-sm rounded-4 overflow-hidden">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Created</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => (
                    <tr key={category._id}>
                      <td>
                        <div className="fw-semibold">{category.name || "—"}</div>
                        {category.image && (
                          <img
                            src={typeof category.image === "string" ? category.image : ""}
                            alt={category.name}
                            className="mt-1 rounded-3"
                            style={{ width: "40px", height: "40px", objectFit: "cover", display: "none" }}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                      </td>
                      <td>{category.description || "—"}</td>
                      <td>{new Date(category.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          <button className="btn btn-outline-primary btn-sm" onClick={() => handleEdit(category)}>
                            <FaPenToSquare />
                          </button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => setDeleteTarget(category)}>
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
        </div>
      </div>

      {deleteTarget && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content rounded-4 border-0">
              <div className="modal-header">
                <h5 className="modal-title">Delete Category</h5>
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
      )}
    </div>
  );
}

export default Categories;