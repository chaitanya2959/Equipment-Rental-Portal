import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

function AddEquipment() {
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
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitMessage("");
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
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
        headers: {
          "Content-Type": "multipart/form-data",
        },
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
    <div className="container-fluid px-0">
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
        <div className="row g-0">
          <div className="col-lg-4 bg-dark text-white p-4 p-lg-5 d-flex flex-column justify-content-between">
            <div>
              <p className="text-uppercase small fw-semibold mb-2 text-info">Owner workspace</p>
              <h2 className="fw-bold mb-3">List a new equipment item</h2>
              <p className="text-white-50 mb-0">
                Showcase your product with rich details, premium visuals, and instant availability for renters.
              </p>
            </div>
            <div className="mt-4 rounded-4 border border-white border-opacity-10 p-3 bg-white bg-opacity-10">
              <div className="d-flex justify-content-between small">
                <span>Fast setup</span>
                <strong>⚡</strong>
              </div>
              <div className="d-flex justify-content-between small mt-2">
                <span>Professional listing</span>
                <strong>✨</strong>
              </div>
            </div>
          </div>

          <div className="col-lg-8 p-4 p-lg-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 className="fw-bold mb-1">Add Equipment</h3>
                <p className="text-muted mb-0">Create a polished listing with clear details and visuals.</p>
              </div>
              <span className="badge bg-success-subtle text-success px-3 py-2">Live listing</span>
            </div>

            {submitMessage ? (
              <div className={`alert ${submitMessage.includes("success") ? "alert-success" : "alert-danger"}`}>
                {submitMessage}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} noValidate>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Equipment Name</label>
                  <input type="text" className={`form-control form-control-lg ${errors.name ? "is-invalid" : ""}`} name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Canon EOS R5" />
                  {errors.name ? <div className="invalid-feedback">{errors.name}</div> : null}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Category</label>
                  <select className={`form-select form-select-lg ${errors.category ? "is-invalid" : ""}`} name="category" value={formData.category} onChange={handleChange}>
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category ? <div className="invalid-feedback">{errors.category}</div> : null}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Brand</label>
                  <input type="text" className={`form-control form-control-lg ${errors.brand ? "is-invalid" : ""}`} name="brand" value={formData.brand} onChange={handleChange} placeholder="Brand name" />
                  {errors.brand ? <div className="invalid-feedback">{errors.brand}</div> : null}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Price per Day</label>
                  <input type="number" min="1" className={`form-control form-control-lg ${errors.pricePerDay ? "is-invalid" : ""}`} name="pricePerDay" value={formData.pricePerDay} onChange={handleChange} placeholder="1500" />
                  {errors.pricePerDay ? <div className="invalid-feedback">{errors.pricePerDay}</div> : null}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Deposit</label>
                  <input type="number" min="0" className={`form-control form-control-lg ${errors.deposit ? "is-invalid" : ""}`} name="deposit" value={formData.deposit} onChange={handleChange} placeholder="5000" />
                  {errors.deposit ? <div className="invalid-feedback">{errors.deposit}</div> : null}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Quantity</label>
                  <input type="number" min="1" className={`form-control form-control-lg ${errors.quantity ? "is-invalid" : ""}`} name="quantity" value={formData.quantity} onChange={handleChange} placeholder="1" />
                  {errors.quantity ? <div className="invalid-feedback">{errors.quantity}</div> : null}
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Location</label>
                  <input type="text" className={`form-control form-control-lg ${errors.location ? "is-invalid" : ""}`} name="location" value={formData.location} onChange={handleChange} placeholder="Mumbai, India" />
                  {errors.location ? <div className="invalid-feedback">{errors.location}</div> : null}
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea rows="4" className={`form-control ${errors.description ? "is-invalid" : ""}`} name="description" value={formData.description} onChange={handleChange} placeholder="Describe the item, condition, usage, and highlights." />
                  {errors.description ? <div className="invalid-feedback">{errors.description}</div> : null}
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Upload Images</label>
                  <input type="file" className={`form-control ${errors.images ? "is-invalid" : ""}`} multiple accept="image/*" onChange={handleImageChange} />
                  {errors.images ? <div className="invalid-feedback">{errors.images}</div> : null}
                  <div className="form-text">Upload up to 5 high-quality photos for a premium listing.</div>
                </div>

                {previewImages.length > 0 ? (
                  <div className="col-12">
                    <div className="row g-3">
                      {previewImages.map((image, index) => (
                        <div className="col-6 col-md-4" key={`${image}-${index}`}>
                          <img src={image} alt={`Preview ${index + 1}`} className="img-fluid rounded-4 shadow-sm border" style={{ height: "140px", objectFit: "cover", width: "100%" }} />
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
                    {loading ? "Publishing..." : "Publish Equipment"}
                  </button>
                  <button type="button" className="btn btn-outline-secondary btn-lg px-4" onClick={() => navigate("/owner/equipment")}>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddEquipment;