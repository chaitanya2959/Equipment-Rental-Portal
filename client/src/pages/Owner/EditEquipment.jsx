import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaCircleCheck, FaTrash } from "react-icons/fa6";
import API from "../../services/api";

const imageBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const placeholderImage = "https://via.placeholder.com/900x600?text=No+Image";

const categories = [
  "Electronics",
  "Cameras",
  "Computers",
  "Audio Equipment",
  "Dress",
  "Jewellery",
  "Hair Accessories",
  "Footwear",
  "Sports Equipment",
  "Fitness Equipment",
  "Tools & Machinery",
  "Construction Equipment",
  "Furniture",
  "Home Appliances",
  "Event & Party Items",
  "Musical Instruments",
  "Photography Equipment",
  "Gaming Console",
  "Vehicles",
  "Medical Equipment",
  "Books",
  "Kids Toys",
  "Other",
];

const getImageUrl = (value) => {
  if (!value) return placeholderImage;
  if (/^https?:\/\//i.test(value)) return value;
  return `${imageBaseUrl}/uploads/${value}`;
};

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
  const [originalImages, setOriginalImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchEquipment();
  }, [id]);

  const fetchEquipment = async () => {
    try {
      setIsLoadingData(true);
      setError("");
      const res = await API.get(`/equipment/${id}`);
      const equipment = res?.data?.data || {};

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
      setOriginalImages(equipment?.images || []);
      setNewImages([]);
      setNewPreviews([]);
    } catch (err) {
      console.error(err);
      setError("Unable to load this equipment item.");
    } finally {
      setIsLoadingData(false);
    }
  };

  const hasImageChanges = useMemo(() => {
    if (newImages.length > 0) return true;
    if (existingImages.length !== originalImages.length) return true;
    return existingImages.some((image, index) => image !== originalImages[index]);
  }, [existingImages, newImages.length, originalImages]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);
    setValidationErrors((prev) => ({ ...prev, images: "" }));
    e.target.value = "";
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, imageIndex) => imageIndex !== index));
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, imageIndex) => imageIndex !== index));
    setNewPreviews((prev) => prev.filter((_, imageIndex) => imageIndex !== index));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = "Equipment name is required.";
    if (!formData.category) nextErrors.category = "Category is required.";
    if (!formData.brand.trim()) nextErrors.brand = "Brand is required.";
    if (!formData.description.trim()) nextErrors.description = "Description is required.";
    if (!formData.pricePerDay || Number(formData.pricePerDay) <= 0) nextErrors.pricePerDay = "Enter a valid daily price.";
    if (!formData.deposit || Number(formData.deposit) < 0) nextErrors.deposit = "Enter a valid deposit.";
    if (!formData.quantity || Number(formData.quantity) <= 0) nextErrors.quantity = "Quantity must be at least 1.";
    if (!formData.location.trim()) nextErrors.location = "Location is required.";
    if (existingImages.length + newImages.length === 0) nextErrors.images = "At least one image is required.";

    setValidationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildImageFiles = async () => {
    const keptExistingImages = existingImages;
    const existingFilePromises = keptExistingImages.map(async (image, index) => {
      const url = getImageUrl(image);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Unable to preserve existing image ${index + 1}.`);
      }

      const blob = await response.blob();
      const fallbackName = typeof image === "string" && image.trim() ? image.split("/").pop().split("?")[0] : `existing-${index + 1}.jpg`;
      return new File([blob], fallbackName || `existing-${index + 1}.jpg`, {
        type: blob.type || "image/jpeg",
      });
    });

    return [...(await Promise.all(existingFilePromises)), ...newImages];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

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

      if (hasImageChanges) {
        const files = await buildImageFiles();
        files.forEach((file) => data.append("images", file));
      } else {
        data.append("keepImages", "true");
      }

      await API.put(`/equipment/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Equipment updated successfully!");
      setTimeout(() => navigate("/owner/equipment"), 1200);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Unable to update this equipment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
        <div className="row g-0">
          <div
            className="col-lg-4 text-white p-4 p-lg-5 d-flex flex-column justify-content-between"
            style={{
              background:
                "linear-gradient(160deg, #0f172a 0%, #111827 38%, #1d4ed8 100%)",
            }}
          >
            <div className="d-grid gap-4">
              <div>
                <p className="text-uppercase small fw-semibold mb-2 text-info">Owner workspace</p>
                <h2 className="fw-bold mb-3">Update equipment details</h2>
                <p className="text-white-50 mb-0">
                  Adjust pricing, availability, and images without changing the listing identity.
                </p>
              </div>

              <div className="border border-white border-opacity-10 rounded-4 p-4 bg-white bg-opacity-10">
                <div className="d-flex justify-content-between small">
                  <span>Current images</span>
                  <strong>{existingImages.length}</strong>
                </div>
                <div className="d-flex justify-content-between small mt-2">
                  <span>New uploads</span>
                  <strong>{newImages.length}</strong>
                </div>
                <div className="d-flex justify-content-between small mt-2">
                  <span>Last updated</span>
                  <strong>{isLoadingData ? "Loading" : "Ready"}</strong>
                </div>
              </div>

              <div className="border border-white border-opacity-10 rounded-4 p-4 bg-white bg-opacity-10">
                <div className="fw-semibold mb-2">Image workflow</div>
                <div className="small text-white-50 d-grid gap-2">
                  <div>Remove existing images you do not want to keep.</div>
                  <div>Add new images with the upload control.</div>
                  <div>The form resubmits the exact image set to the backend.</div>
                </div>
              </div>

              <div className="border border-white border-opacity-10 rounded-4 p-4 bg-white bg-opacity-10">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <FaCircleCheck className="text-info" />
                  <span className="fw-semibold">Validation</span>
                </div>
                <div className="small text-white-50">
                  Required fields, price ranges, and at least one image are enforced before submit.
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-8 p-4 p-lg-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 className="fw-bold mb-1">Edit Equipment</h3>
                <p className="text-muted mb-0">Update the listing and manage images from one place.</p>
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
                    <input
                      type="text"
                      className={`form-control form-control-lg ${validationErrors.name ? "is-invalid" : ""}`}
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                    {validationErrors.name ? <div className="invalid-feedback">{validationErrors.name}</div> : null}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Category</label>
                    <select
                      className={`form-select form-select-lg ${validationErrors.category ? "is-invalid" : ""}`}
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {validationErrors.category ? <div className="invalid-feedback">{validationErrors.category}</div> : null}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Brand</label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${validationErrors.brand ? "is-invalid" : ""}`}
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                    />
                    {validationErrors.brand ? <div className="invalid-feedback">{validationErrors.brand}</div> : null}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Price per Day</label>
                    <input
                      type="number"
                      min="1"
                      className={`form-control form-control-lg ${validationErrors.pricePerDay ? "is-invalid" : ""}`}
                      name="pricePerDay"
                      value={formData.pricePerDay}
                      onChange={handleChange}
                    />
                    {validationErrors.pricePerDay ? <div className="invalid-feedback">{validationErrors.pricePerDay}</div> : null}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Deposit</label>
                    <input
                      type="number"
                      min="0"
                      className={`form-control form-control-lg ${validationErrors.deposit ? "is-invalid" : ""}`}
                      name="deposit"
                      value={formData.deposit}
                      onChange={handleChange}
                    />
                    {validationErrors.deposit ? <div className="invalid-feedback">{validationErrors.deposit}</div> : null}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      className={`form-control form-control-lg ${validationErrors.quantity ? "is-invalid" : ""}`}
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                    />
                    {validationErrors.quantity ? <div className="invalid-feedback">{validationErrors.quantity}</div> : null}
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">Location</label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${validationErrors.location ? "is-invalid" : ""}`}
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                    />
                    {validationErrors.location ? <div className="invalid-feedback">{validationErrors.location}</div> : null}
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                      rows="4"
                      className={`form-control ${validationErrors.description ? "is-invalid" : ""}`}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                    />
                    {validationErrors.description ? <div className="invalid-feedback">{validationErrors.description}</div> : null}
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">Images</label>
                    <input type="file" className={`form-control ${validationErrors.images ? "is-invalid" : ""}`} multiple accept="image/*" onChange={handleImageChange} />
                    {validationErrors.images ? <div className="invalid-feedback">{validationErrors.images}</div> : null}
                    <div className="form-text">Remove, add, or replace images before saving.</div>
                  </div>

                  {existingImages.length > 0 ? (
                    <div className="col-12" id="images">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="fw-semibold mb-0">Current Images</h6>
                        <span className="badge bg-light text-dark">{existingImages.length} kept</span>
                      </div>
                      <div className="row g-3">
                        {existingImages.map((image, index) => (
                          <div className="col-6 col-md-4 col-lg-3" key={`existing-${image}-${index}`}>
                            <div className="position-relative">
                              <img
                                src={getImageUrl(image)}
                                alt={`Current ${index + 1}`}
                                className="img-fluid rounded-4 shadow-sm border"
                                style={{ height: "140px", objectFit: "cover", width: "100%" }}
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle"
                                style={{ width: "30px", height: "30px", padding: 0 }}
                                onClick={() => removeExistingImage(index)}
                                aria-label={`Remove current image ${index + 1}`}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {newPreviews.length > 0 ? (
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="fw-semibold mb-0">New Image Preview</h6>
                        <span className="badge bg-light text-dark">{newPreviews.length} new</span>
                      </div>
                      <div className="row g-3">
                        {newPreviews.map((preview, index) => (
                          <div className="col-6 col-md-4 col-lg-3" key={`new-${preview}-${index}`}>
                            <div className="position-relative">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="img-fluid rounded-4 shadow-sm border"
                                style={{ height: "140px", objectFit: "cover", width: "100%" }}
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle"
                                style={{ width: "30px", height: "30px", padding: 0 }}
                                onClick={() => removeNewImage(index)}
                                aria-label={`Remove new image ${index + 1}`}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        name="available"
                        checked={formData.available}
                        onChange={handleChange}
                      />
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
