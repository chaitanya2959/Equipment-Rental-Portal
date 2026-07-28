import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaChartLine,
  FaCheck,
  FaCircleCheck,
  FaGaugeHigh,
  FaIndianRupeeSign,
  FaStar,
  FaTruckFast,
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

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

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
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [heroLoading, setHeroLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [summaryRes, bookingsRes] = await Promise.all([
          API.get("/dashboard/owner"),
          API.get("/dashboard/owner/recent-bookings"),
        ]);
        if (!active) return;
        setDashboardSummary(summaryRes?.data?.data || null);
        setRecentBookings(bookingsRes?.data?.data || []);
      } catch {
        if (!active) return;
        setDashboardSummary(null);
        setRecentBookings([]);
      } finally {
        if (active) setHeroLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const heroStats = useMemo(
    () => [
      { label: "Total Equipments", value: dashboardSummary?.totalEquipments ?? 0, icon: FaGaugeHigh },
      { label: "Active Rentals", value: dashboardSummary?.activeRentals ?? 0, icon: FaTruckFast },
      {
        label: "Monthly Revenue",
        value: formatCurrency(
          recentBookings.reduce((total, booking) => {
            const bookingDate = new Date(booking.createdAt);
            const now = new Date();
            const isCurrentMonth =
              bookingDate.getMonth() === now.getMonth() &&
              bookingDate.getFullYear() === now.getFullYear();
            return isCurrentMonth && booking.paymentStatus === "Paid"
              ? total + Number(booking.totalAmount || 0)
              : total;
          }, 0)
        ),
        icon: FaIndianRupeeSign,
      },
      { label: "Owner Rating", value: `${Number(dashboardSummary?.averageRating || 0).toFixed(1)} / 5`, icon: FaStar },
      {
        label: "Recent Activity",
        value: recentBookings[0]?.equipment?.name ? `Booked ${recentBookings[0].equipment.name}` : "No recent bookings",
        icon: FaChartLine,
      },
    ],
    [dashboardSummary, recentBookings]
  );

  const supportedCategories = categories.slice(0, 6);

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
                <h2 className="fw-bold mb-3">List a new equipment item</h2>
                <p className="text-white-50 mb-0">
                  Add strong photos, correct pricing, and clear details so renters can find and book your listing faster.
                </p>
              </div>

              <div className="border border-white border-opacity-10 rounded-4 p-4 bg-white bg-opacity-10">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <div className="small text-white-50">Equipment upload guide</div>
                    <div className="fw-semibold">Better listing, more bookings</div>
                  </div>
                  <span className="badge bg-light text-dark">Live</span>
                </div>

                <div className="d-grid gap-2">
                  {[
                    "Upload HD images",
                    "Mention the brand",
                    "Set a real deposit",
                    "Enter the correct location",
                    "Keep availability updated",
                  ].map((tip) => (
                    <div key={tip} className="d-flex align-items-center gap-2 small">
                      <FaCheck className="text-info" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="row g-3">
                {heroLoading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <div className="col-6" key={index}>
                        <div className="border border-white border-opacity-10 rounded-4 p-3 bg-white bg-opacity-10">
                          <div className="placeholder-glow">
                            <span className="placeholder col-6 bg-light" />
                            <span className="placeholder col-8 bg-light d-block mt-2" />
                          </div>
                        </div>
                      </div>
                    ))
                  : heroStats.map((stat) => (
                      <div className="col-6" key={stat.label}>
                        <div className="border border-white border-opacity-10 rounded-4 p-3 bg-white bg-opacity-10 h-100">
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="small text-white-50">{stat.label}</div>
                            <stat.icon aria-hidden="true" />
                          </div>
                          <div className="fw-bold fs-5 mt-2">{stat.value}</div>
                        </div>
                      </div>
                    ))}
              </div>

              <div className="border border-white border-opacity-10 rounded-4 p-4 bg-white bg-opacity-10">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <div className="small text-white-50">Supported categories</div>
                    <div className="fw-semibold">Quick pick</div>
                  </div>
                  <FaCircleCheck className="text-info" />
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {supportedCategories.map((category) => (
                    <span key={category} className="badge bg-light text-dark rounded-pill px-3 py-2">
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border border-white border-opacity-10 rounded-4 p-4 bg-white bg-opacity-10">
                <div className="fw-semibold mb-2">Quick tips</div>
                <div className="small text-white-50 d-grid gap-2">
                  <div>Use the first image as the cover photo.</div>
                  <div>Keep titles short and searchable.</div>
                  <div>Good photos and correct pricing improve bookings.</div>
                </div>
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
              <div className={`alert ${submitMessage.toLowerCase().includes("success") ? "alert-success" : "alert-danger"}`}>
                {submitMessage}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} noValidate>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Equipment Name</label>
                  <input
                    type="text"
                    className={`form-control form-control-lg ${errors.name ? "is-invalid" : ""}`}
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
                    className={`form-select form-select-lg ${errors.category ? "is-invalid" : ""}`}
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
                    className={`form-control form-control-lg ${errors.brand ? "is-invalid" : ""}`}
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Brand name"
                  />
                  {errors.brand ? <div className="invalid-feedback">{errors.brand}</div> : null}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Price per Day</label>
                  <input
                    type="number"
                    min="1"
                    className={`form-control form-control-lg ${errors.pricePerDay ? "is-invalid" : ""}`}
                    name="pricePerDay"
                    value={formData.pricePerDay}
                    onChange={handleChange}
                    placeholder="1500"
                  />
                  {errors.pricePerDay ? <div className="invalid-feedback">{errors.pricePerDay}</div> : null}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Deposit</label>
                  <input
                    type="number"
                    min="0"
                    className={`form-control form-control-lg ${errors.deposit ? "is-invalid" : ""}`}
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleChange}
                    placeholder="5000"
                  />
                  {errors.deposit ? <div className="invalid-feedback">{errors.deposit}</div> : null}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    className={`form-control form-control-lg ${errors.quantity ? "is-invalid" : ""}`}
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="1"
                  />
                  {errors.quantity ? <div className="invalid-feedback">{errors.quantity}</div> : null}
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Location</label>
                  <input
                    type="text"
                    className={`form-control form-control-lg ${errors.location ? "is-invalid" : ""}`}
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Mumbai, India"
                  />
                  {errors.location ? <div className="invalid-feedback">{errors.location}</div> : null}
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

                <div className="col-12" id="images">
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
                </div>

                {previewImages.length > 0 ? (
                  <div className="col-12">
                    <div className="row g-3">
                      {previewImages.map((image, index) => (
                        <div className="col-6 col-md-4" key={`${image}-${index}`}>
                          <img
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="img-fluid rounded-4 shadow-sm border"
                            style={{ height: "140px", objectFit: "cover", width: "100%" }}
                          />
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
