import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCircleInfo,
  FaImage,
  FaLocationDot,
  FaTags,
  FaTruckFast,
  FaUser,
} from "react-icons/fa6";
import API from "../../services/api";

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

function AddEquipment() {
  const navigate = useNavigate();
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
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitMessage("");
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    setPreviewImages(files.map((file) => URL.createObjectURL(file)));
    setErrors((prev) => ({ ...prev, images: "" }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = "Equipment name is required.";
    if (!formData.category) nextErrors.category = "Please choose a category.";
    if (!formData.brand.trim()) nextErrors.brand = "Brand is required.";
    if (!formData.description.trim()) nextErrors.description = "Description is required.";
    if (!formData.pricePerDay || Number(formData.pricePerDay) <= 0) nextErrors.pricePerDay = "Enter a valid daily price.";
    if (!formData.deposit || Number(formData.deposit) < 0) nextErrors.deposit = "Enter a valid deposit.";
    if (!formData.quantity || Number(formData.quantity) <= 0) nextErrors.quantity = "Quantity must be at least 1.";
    if (!formData.location.trim()) nextErrors.location = "Location is required.";
    if (images.length === 0) nextErrors.images = "Upload at least one image.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setSubmitMessage("");

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

      images.forEach((image) => data.append("images", image));

      const res = await API.post("/equipment", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmitMessage(res?.data?.message || "Equipment added successfully.");
      navigate("/owner/equipment");
    } catch (error) {
      setSubmitMessage(error.response?.data?.message || "Unable to add equipment right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="owner-page-header d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-2 mb-4">
        <div>
          <p className="owner-page-eyebrow mb-1">Owner Workspace</p>
          <h1 className="owner-page-title mb-1">Add Equipment</h1>
          <p className="owner-page-subtitle mb-0">Create a polished listing with clear details and visuals.</p>
        </div>
        <span className="badge bg-success-subtle text-success px-3 py-2">New listing</span>
      </div>

      {submitMessage ? (
        <div className={`alert ${submitMessage.toLowerCase().includes("success") ? "alert-success" : "alert-danger"} mb-4`}>
          {submitMessage}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-3">
          {/* Left column — Equipment Info + Pricing + Availability */}
          <div className="col-12 col-lg-8">
            {/* Equipment Information */}
            <div className="owner-section-card mb-3">
              <div className="card-body p-4">
                <div className="owner-section-heading mb-4">
                  <span className="owner-section-icon bg-primary-subtle text-primary">
                    <FaUser />
                  </span>
                  <div>
                    <h4 className="fw-bold mb-0">Equipment Information</h4>
                    <p className="text-muted mb-0 small">Core details about your rental item.</p>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Equipment Name</label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? "is-invalid" : ""}`}
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Canon EOS R5"
                    />
                    {errors.name ? <div className="invalid-feedback">{errors.name}</div> : null}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Category</label>
                    <select
                      className={`form-select ${errors.category ? "is-invalid" : ""}`}
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">Select category</option>
                      {categories.map((categoryName) => (
                        <option key={categoryName} value={categoryName}>
                          {categoryName}
                        </option>
                      ))}
                    </select>
                    {errors.category ? <div className="invalid-feedback">{errors.category}</div> : null}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Brand</label>
                    <input
                      type="text"
                      className={`form-control ${errors.brand ? "is-invalid" : ""}`}
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="Brand name"
                    />
                    {errors.brand ? <div className="invalid-feedback">{errors.brand}</div> : null}
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                      rows="4"
                      className={`form-control ${errors.description ? "is-invalid" : ""}`}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the item, condition, usage, and highlights."
                    />
                    {errors.description ? <div className="invalid-feedback">{errors.description}</div> : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="owner-section-card mb-3">
              <div className="card-body p-4">
                <div className="owner-section-heading mb-4">
                  <span className="owner-section-icon bg-success-subtle text-success">
                    <FaTags />
                  </span>
                  <div>
                    <h4 className="fw-bold mb-0">Pricing</h4>
                    <p className="text-muted mb-0 small">Set competitive rental rates and deposit.</p>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Price per Day</label>
                    <input
                      type="number"
                      min="1"
                      className={`form-control ${errors.pricePerDay ? "is-invalid" : ""}`}
                      name="pricePerDay"
                      value={formData.pricePerDay}
                      onChange={handleChange}
                      placeholder="1500"
                    />
                    {errors.pricePerDay ? <div className="invalid-feedback">{errors.pricePerDay}</div> : null}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Deposit</label>
                    <input
                      type="number"
                      min="0"
                      className={`form-control ${errors.deposit ? "is-invalid" : ""}`}
                      name="deposit"
                      value={formData.deposit}
                      onChange={handleChange}
                      placeholder="5000"
                    />
                    {errors.deposit ? <div className="invalid-feedback">{errors.deposit}</div> : null}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      className={`form-control ${errors.quantity ? "is-invalid" : ""}`}
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="1"
                    />
                    {errors.quantity ? <div className="invalid-feedback">{errors.quantity}</div> : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Availability + Location */}
            <div className="owner-section-card mb-3">
              <div className="card-body p-4">
                <div className="owner-section-heading mb-4">
                  <span className="owner-section-icon bg-info-subtle text-info">
                    <FaTruckFast />
                  </span>
                  <div>
                    <h4 className="fw-bold mb-0">Availability & Location</h4>
                    <p className="text-muted mb-0 small">Control booking status and pickup address.</p>
                  </div>
                </div>

                <div className="row g-3 align-items-center">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Availability Status</label>
                    <div className="form-check form-switch fs-5">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        name="available"
                        checked={formData.available}
                        onChange={handleChange}
                      />
                      <label className="form-check-label fw-semibold">
                        {formData.available ? "Available for booking" : "Unavailable for booking"}
                      </label>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <FaLocationDot className="me-1" /> Location / Address
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.location ? "is-invalid" : ""}`}
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Mumbai, India"
                    />
                    {errors.location ? <div className="invalid-feedback">{errors.location}</div> : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column — Image upload + Tips */}
          <div className="col-12 col-lg-4">
            <div className="owner-section-card mb-3">
              <div className="card-body p-4">
                <div className="owner-section-heading mb-4">
                  <span className="owner-section-icon bg-warning-subtle text-warning">
                    <FaImage />
                  </span>
                  <div>
                    <h4 className="fw-bold mb-0">Equipment Image</h4>
                    <p className="text-muted mb-0 small">Upload high-quality photos.</p>
                  </div>
                </div>

                <label className="form-label fw-semibold">Upload Images</label>
                <input
                  type="file"
                  className={`form-control ${errors.images ? "is-invalid" : ""}`}
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {errors.images ? <div className="invalid-feedback">{errors.images}</div> : null}
                <div className="form-text">Upload up to 5 high-quality photos for a premium listing.</div>

                {previewImages.length > 0 ? (
                  <div className="row g-2 mt-2">
                    {previewImages.map((image, index) => (
                      <div className="col-6 col-md-4" key={`${image}-${index}`}>
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="img-fluid rounded-3 border"
                          style={{ height: "100px", objectFit: "cover", width: "100%" }}
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="owner-section-card">
              <div className="card-body p-4">
                <div className="owner-section-heading mb-3">
                  <span className="owner-section-icon bg-primary-subtle text-primary">
                    <FaCircleInfo />
                  </span>
                  <div>
                    <h5 className="fw-bold mb-0">Listing Tips</h5>
                  </div>
                </div>
                <ul className="text-muted small mb-0 ps-3 d-grid gap-1">
                  <li>Use the first image as the cover photo.</li>
                  <li>Keep titles short and searchable.</li>
                  <li>Mention the brand clearly.</li>
                  <li>Set a real deposit amount.</li>
                  <li>Enter the correct location.</li>
                  <li>Keep availability updated.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
          <button type="submit" className="btn btn-primary btn-lg px-4" disabled={loading}>
            {loading ? "Publishing..." : "Publish Equipment"}
          </button>
          <button type="button" className="btn btn-outline-secondary btn-lg px-4" onClick={() => navigate("/owner/equipment")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddEquipment;