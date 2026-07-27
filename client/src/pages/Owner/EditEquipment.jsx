import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

function EditEquipment() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
    pricePerDay: "",
    deposit: "",
    quantity: "",
    location: "",
    available: true,
  });
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const categories = [
    "Electronics", "Cameras", "Computers", "Audio Equipment", "Dress",
    "Jewellery", "Hair Accessories", "Footwear", "Sports Equipment",
    "Fitness Equipment", "Tools & Machinery", "Construction Equipment",
    "Furniture", "Home Appliances", "Event & Party Items",
    "Musical Instruments", "Photography Equipment", "Gaming Console",
    "Vehicles", "Medical Equipment", "Books", "Kids Toys", "Other",
  ];

  useEffect(() => {
    fetchEquipment();
  }, [id]);

  const fetchEquipment = async () => {
    try {
      setIsLoadingData(true);
      setError("");
      const res = await API.get(`/equipment/${id}`);
      const equipment = res?.data?.data;

      setFormData({
        name: equipment?.name || "",
        category: equipment?.category || "",
        brand: equipment?.brand || "",
        description: equipment?.description || "",
        pricePerDay: equipment?.pricePerDay || "",
        deposit: equipment?.deposit || "",
        quantity: equipment?.quantity || "",
        location: equipment?.location || "",
        available: equipment?.available ?? true,
      });
      setExistingImages(equipment?.images || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load this equipment item.");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
    setNewPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const removeExistingImage = (index) => {
    const image = existingImages[index];
    setRemovedImages((prev) => [...prev, image]);
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data = new FormData();
      data.append("name", formData.name);
      data.append("category", formData.category);
      data.append("brand", formData.brand);
      data.append("description", formData.description);
      data.append("pricePerDay", formData.pricePerDay);
      data.append("deposit", formData.deposit);
      data.append("quantity", formData.quantity);
      data.append("location", formData.location);
      data.append("available", String(formData.available));

      // If no new images and we have existing ones, tell backend to keep them
      if (newImages.length === 0 && existingImages.length > 0) {
        data.append("keepImages", "true");
      }

      // Add new images
      newImages.forEach((image) => data.append("images", image));

      await API.put(`/equipment/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Equipment updated successfully!");
      setTimeout(() => navigate("/owner/equipment"), 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to update this equipment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
        <div className="row g-0">
          <div className="col-lg-4 bg-dark text-white p-4 p-lg-5 d-flex flex-column justify-content-between">
            <div>
              <p className="text-uppercase small fw-semibold mb-2 text-info">Owner workspace</p>
              <h2 className="fw-bold mb-3">Update equipment details</h2>
              <p className="text-white-50 mb-0">Revise pricing, availability, and visuals while preserving your existing listing identity.</p>
            </div>
            <div className="mt-4 rounded-4 border border-white border-opacity-10 p-3 bg-white bg-opacity-10">
              <div className="d-flex justify-content-between small">
                <span>Replace images</span>
                <strong>🖼️</strong>
              </div>
              <div className="d-flex justify-content-between small mt-2">
                <span>Instant sync</span>
                <strong>⚡</strong>
              </div>
            </div>
          </div>

          <div className="col-lg-8 p-4 p-lg-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 className="fw-bold mb-1">Edit Equipment</h3>
                <p className="text-muted mb-0">Populate the form and update your listing in a few clicks.</p>
              </div>
              <span className="badge bg-warning-subtle text-warning px-3 py-2">Editing</span>
            </div>

            {error ? <div className="alert alert-danger">{error}</div> : null}
            {success ? <div className="alert alert-success">{success}</div> : null}

            {isLoadingData ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-3 text-muted">Loading equipment details...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Equipment Name</label>
                    <input type="text" className="form-control form-control-lg" name="name" value={formData.name} onChange={handleChange} />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Category</label>
                    <select className="form-select form-select-lg" name="category" value={formData.category} onChange={handleChange}>
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Brand</label>
                    <input type="text" className="form-control form-control-lg" name="brand" value={formData.brand} onChange={handleChange} />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Price per Day</label>
                    <input type="number" min="1" className="form-control form-control-lg" name="pricePerDay" value={formData.pricePerDay} onChange={handleChange} />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Deposit</label>
                    <input type="number" min="0" className="form-control form-control-lg" name="deposit" value={formData.deposit} onChange={handleChange} />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Quantity</label>
                    <input type="number" min="1" className="form-control form-control-lg" name="quantity" value={formData.quantity} onChange={handleChange} />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">Location</label>
                    <input type="text" className="form-control form-control-lg" name="location" value={formData.location} onChange={handleChange} />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea rows="4" className="form-control" name="description" value={formData.description} onChange={handleChange} />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">Add New Images</label>
                    <input type="file" className="form-control" multiple accept="image/*" onChange={handleImageChange} />
                    <div className="form-text">Select new images to replace existing ones. Leave empty to keep current images.</div>
                  </div>

                  {existingImages.length > 0 ? (
                    <div className="col-12">
                      <h6 className="fw-semibold">Current Images</h6>
                      <div className="row g-3">
                        {existingImages.map((image, index) => (
                          <div className="col-6 col-md-4 col-lg-3" key={`existing-${index}`}>
                            <div className="position-relative">
                              <img
                                src={`http://localhost:5000/uploads/${image}`}
                                alt={`Current ${index + 1}`}
                                className="img-fluid rounded-4 shadow-sm border"
                                style={{ height: "140px", objectFit: "cover", width: "100%" }}
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle"
                                style={{ width: "28px", height: "28px", padding: 0 }}
                                onClick={() => removeExistingImage(index)}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {newPreviews.length > 0 ? (
                    <div className="col-12">
                      <h6 className="fw-semibold">New Images Preview</h6>
                      <div className="row g-3">
                        {newPreviews.map((preview, index) => (
                          <div className="col-6 col-md-4 col-lg-3" key={`new-${index}`}>
                            <div className="position-relative">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="img-fluid rounded-4 shadow-sm border"
                                style={{ height: "140px", objectFit: "cover", width: "100%" }}
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle"
                                style={{ width: "28px", height: "28px", padding: 0 }}
                                onClick={() => removeNewImage(index)}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" role="switch" name="available" checked={formData.available} onChange={handleChange} />
                      <label className="form-check-label fw-semibold">Available for booking</label>
                    </div>
                  </div>

                  <div className="col-12 d-flex flex-column flex-md-row gap-3">
                    <button type="submit" className="btn btn-primary btn-lg px-4" disabled={loading}>
                      {loading ? "Updating..." : "Update Equipment"}
                    </button>
                    <button type="button" className="btn btn-outline-secondary btn-lg px-4" onClick={() => navigate("/owner/equipment")}>
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditEquipment;