import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BackButton from "../../components/Common/BackButton";
import {
  FaCalendarDays,
  FaHeart,
  FaMagnifyingGlass,
  FaMapLocationDot,
  FaRegStar,
  FaTrash,
} from "react-icons/fa6";
import { getMyWishlist, removeWishlistItem } from "../../services/wishlistService";

const imageBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const placeholderImage = "https://via.placeholder.com/800x520?text=No+Image";

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

const getImageUrl = (equipment) => {
  const image = equipment?.images?.[0];
  if (!image) return placeholderImage;
  if (/^https?:\/\//i.test(image)) return image;
  return `${imageBaseUrl}/uploads/${image}`;
};

function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchWishlist();
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMyWishlist();
      setItems(data);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Unable to load wishlist.");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const sorted = [...items].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
    );

    if (!query) return sorted;

    return sorted.filter((item) => {
      const equipment = item.equipment || {};
      const haystack = [equipment.name, equipment.brand, equipment.category, equipment.location]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [items, search]);

  const stats = useMemo(() => {
    const categories = new Set(filteredItems.map((item) => item.equipment?.category).filter(Boolean));
    const totalValue = filteredItems.reduce((sum, item) => sum + Number(item.equipment?.pricePerDay || 0), 0);

    return [
      { title: "Saved Items", value: filteredItems.length, subtitle: "Live wishlist", color: "primary" },
      { title: "Categories", value: categories.size, subtitle: "Unique types", color: "success" },
      { title: "Daily Value", value: formatCurrency(totalValue), subtitle: "Combined price/day", color: "info" },
    ];
  }, [filteredItems]);

  const handleRemove = async (item) => {
    const confirmed = window.confirm(`Remove ${item.equipment?.name || "this equipment"} from your wishlist?`);
    if (!confirmed) return;

    try {
      setRemovingId(item._id);
      await removeWishlistItem(item._id);
      setItems((current) => current.filter((entry) => entry._id !== item._id));
      setToast("Removed from wishlist.");
    } catch (removeError) {
      setError(removeError?.response?.data?.message || "Unable to remove item.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="container-xxl py-4">
      {toast ? <div className="alert alert-success">{toast}</div> : null}

      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <BackButton label="Back" />
          <div>
          <p className="text-uppercase small fw-semibold text-primary mb-2">Customer workspace</p>
          <h2 className="fw-bold mb-1">Wishlist</h2>
          <p className="text-muted mb-0">Saved equipment stays connected to live backend data and availability.</p>
          </div>
        </div>
        <Link className="btn btn-primary rounded-pill" to="/customer/equipment">
          <FaHeart className="me-2" />
          Browse equipment
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-lg-8">
              <label className="form-label fw-semibold">Search saved equipment</label>
              <div className="position-relative">
                <FaMagnifyingGlass className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  className="form-control ps-5"
                  placeholder="Search by name, brand, category, or location"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-lg-4 d-grid">
              <button className="btn btn-outline-secondary" type="button" onClick={fetchWishlist}>
                Refresh wishlist
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {stats.map((card) => (
          <div className="col-12 col-md-6 col-xl-4" key={card.title}>
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4 d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-2">{card.title}</h6>
                  <h3 className={`text-${card.color} fw-bold mb-0`}>{card.value}</h3>
                </div>
                <span className={`badge bg-${card.color}-subtle text-${card.color}`}>{card.subtitle}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading wishlist...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <FaHeart className="fs-1 text-muted mx-auto mb-3" />
          <h4 className="fw-semibold mb-2">Your wishlist is empty</h4>
          <p className="text-muted mb-3">Save equipment from the catalog to compare and book later.</p>
          <Link className="btn btn-primary rounded-pill px-4" to="/customer/equipment">
            Explore equipment
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {filteredItems.map((item) => {
            const equipment = item.equipment || {};
            return (
              <div className="col-12 col-md-6 col-xl-4" key={item._id}>
                <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                  <img
                    alt={equipment.name || "Equipment"}
                    className="img-fluid w-100"
                    src={getImageUrl(equipment)}
                    style={{ height: "220px", objectFit: "cover" }}
                    onError={(event) => {
                      event.currentTarget.src = placeholderImage;
                    }}
                  />
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                      <div>
                        <h5 className="fw-bold mb-1">{equipment.name || "Equipment"}</h5>
                        <div className="text-muted small">{equipment.brand || "Brand unavailable"}</div>
                      </div>
                      <button className="btn btn-outline-danger btn-sm rounded-pill" type="button" onClick={() => handleRemove(item)} disabled={removingId === item._id}>
                        <FaTrash className="me-1" />
                        {removingId === item._id ? "Removing..." : "Remove"}
                      </button>
                    </div>

                    <div className="border rounded-4 p-3 bg-light mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted small">Category</span>
                        <strong className="small">{equipment.category || "—"}</strong>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted small">Location</span>
                        <strong className="small text-truncate">{equipment.location || "—"}</strong>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small">Saved on</span>
                        <strong className="small">{formatDate(item.createdAt)}</strong>
                      </div>
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <div className="border rounded-3 p-2 h-100">
                          <div className="text-muted small">Price/Day</div>
                          <div className="fw-semibold">{formatCurrency(equipment.pricePerDay)}</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="border rounded-3 p-2 h-100">
                          <div className="text-muted small">Rating</div>
                          <div className="fw-semibold d-flex align-items-center gap-1">
                            <FaRegStar className="text-warning" />
                            {Number(equipment.averageRating || 0).toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto d-flex gap-2">
                      <Link className="btn btn-outline-primary btn-sm flex-fill" to={`/customer/equipment/${equipment._id}`}>
                        View Details
                      </Link>
                      <Link className="btn btn-primary btn-sm flex-fill" to={`/customer/equipment/${equipment._id}?book=1`}>
                        <FaCalendarDays className="me-1" />
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
