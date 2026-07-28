import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaCalendarDays,
  FaClock,
  FaCircleCheck,
  FaLocationDot,
  FaMagnifyingGlass,
  FaCamera,
  FaShieldHeart,
  FaStar,
  FaTruckFast,
  FaWandMagicSparkles,
} from "react-icons/fa6";
import api from "../../services/api";
import EquipmentCard from "../../components/cards/EquipmentCard";

const categoryOptions = [
  { label: "Construction", value: "Construction", icon: FaTruckFast },
  { label: "Power Tools", value: "Power Tools", icon: FaWandMagicSparkles },
  { label: "Events", value: "Events", icon: FaCalendarDays },
  { label: "Photography", value: "Photography", icon: FaCamera },
  { label: "Home Care", value: "Home Care", icon: FaShieldHeart },
  { label: "Garden", value: "Garden", icon: FaLocationDot },
];

const highlights = [
  { title: "Verified owners", text: "Approved equipment from accountable suppliers." },
  { title: "Instant discovery", text: "Filter by category, location, availability, and price." },
  { title: "Clear checkout", text: "Professional booking summaries and reminders." },
  { title: "Live notifications", text: "Stay updated on approvals, payments, and returns." },
];

const testimonials = [
  {
    name: "Aarav Mehta",
    role: "Event organizer",
    quote: "The catalog feels like a real marketplace. Search, compare, and book is simple.",
    rating: 5,
  },
  {
    name: "Sana Khan",
    role: "Production lead",
    quote: "The rental flow is straightforward and the summary pages make handoffs easy.",
    rating: 5,
  },
  {
    name: "Vikram Joshi",
    role: "Contractor",
    quote: "Fast filters, readable pricing, and the public site gives enough confidence to browse first.",
    rating: 4,
  },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

function Home() {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("");

  useEffect(() => {
    let active = true;

    const loadEquipment = async () => {
      try {
        setLoading(true);
        const response = await api.get("/equipment");
        if (!active) return;
        setEquipment(response?.data?.data || []);
      } catch {
        if (active) setEquipment([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadEquipment();
    return () => {
      active = false;
    };
  }, []);

  const featuredEquipment = useMemo(() => {
    return [...equipment]
      .sort((a, b) => (b.averageRating ?? b.rating ?? 0) - (a.averageRating ?? a.rating ?? 0))
      .slice(0, 4);
  }, [equipment]);

  const categoryCounts = useMemo(() => {
    const counts = equipment.reduce((acc, item) => {
      if (!item.category) return acc;
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
  }, [equipment]);

  const stats = [
    { label: "Live listings", value: equipment.length || 0 },
    { label: "Top categories", value: categoryCounts.length || 0 },
    { label: "Avg. rating", value: equipment.length ? (equipment.reduce((sum, item) => sum + Number(item.averageRating || item.rating || 0), 0) / equipment.length).toFixed(1) : "0.0" },
    { label: "Starting price", value: equipment.length ? formatCurrency(Math.min(...equipment.map((item) => Number(item.pricePerDay || 0)).filter(Boolean))) : "N/A" },
  ];

  const submitSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("query", search.trim());
    if (category !== "all") params.set("category", category);
    if (location.trim()) params.set("location", location.trim());
    navigate(`/equipment${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div>
      <section className="public-hero py-5">
        <div className="container-fluid py-lg-3">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-7">
              <div className="public-hero-copy">
                <span className="public-hero-pill">
                  <FaShieldHeart />
                  Public rental marketplace
                </span>
                <h1 className="public-hero-title mt-4">
                  Rent professional equipment for <span>events, work, and production</span>.
                </h1>
                <p className="public-hero-subtitle mt-3">
                  Search verified inventory, inspect details before login, and move into booking only when you are ready to sign in.
                </p>
                <div className="d-flex flex-wrap gap-2 mt-4">
                  <Link className="btn btn-primary btn-lg rounded-pill px-4" to="/equipment">
                    Browse equipment
                  </Link>
                  <Link className="btn btn-outline-primary btn-lg rounded-pill px-4" to="/how-it-works">
                    How it works
                  </Link>
                </div>
                <div className="public-badge-row mt-4">
                  <span className="public-badge">Browse first</span>
                  <span className="public-badge">Login to book</span>
                  <span className="public-badge">Professional summaries</span>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <div className="public-search-panel p-3 p-lg-4">
                <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                  <div>
                    <div className="public-section-pill">
                      <FaMagnifyingGlass />
                      Search equipment
                    </div>
                  </div>
                  <Link className="small fw-semibold text-decoration-none" to="/categories">
                    View categories
                  </Link>
                </div>

                <form className="public-search-grid" onSubmit={submitSearch}>
                  <input
                    className="form-control"
                    placeholder="Search equipment"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <select className="form-select" value={category} onChange={(event) => setCategory(event.target.value)}>
                    <option value="all">All categories</option>
                    {categoryOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <input
                    className="form-control"
                    placeholder="Location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                  />
                  <button className="btn btn-primary rounded-pill px-4" type="submit">
                    Search
                  </button>
                </form>

                <div className="public-stat-grid mt-4">
                  {stats.map((stat) => (
                    <div className="public-stat-card" key={stat.label}>
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="container-fluid">
          <div className="d-flex align-items-end justify-content-between gap-3 flex-wrap mb-4">
            <div>
              <span className="public-section-pill mb-3">
                <FaCircleCheck />
                Featured rentals
              </span>
              <h2 className="public-section-title mb-2">Top-rated equipment from active owners</h2>
              <p className="public-section-copy mb-0">
                These listings are pulled from the live catalog and ranked by rating and recency.
              </p>
            </div>
            <Link className="btn btn-outline-primary rounded-pill" to="/equipment">
              View full catalog
              <FaArrowRight />
            </Link>
          </div>

          <div className="row g-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div className="col-12 col-md-6 col-xl-3" key={index}>
                  <div className="public-mini-card placeholder-glow">
                    <div className="placeholder col-12 mb-3" style={{ height: 200 }} />
                    <div className="placeholder col-7 mb-2" />
                    <div className="placeholder col-5 mb-2" />
                    <div className="placeholder col-9" />
                  </div>
                </div>
              ))
            ) : featuredEquipment.length > 0 ? (
              featuredEquipment.map((item) => (
                <EquipmentCard
                  key={item._id || item.id}
                  equipment={item}
                  detailsUrl={`/equipment/${item._id || item.id}`}
                  bookUrl={`/equipment/${item._id || item.id}?book=1`}
                />
              ))
            ) : (
              <div className="col-12">
                <div className="public-mini-card text-center p-5">
                  <h3 className="h5 fw-bold">No equipment is live yet</h3>
                  <p className="public-quiet-note mb-0">Owners will add inventory here once the marketplace is populated.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="container-fluid">
          <div className="row g-4">
            <div className="col-12 col-xl-7">
              <span className="public-section-pill mb-3">
                <FaTruckFast />
                Popular categories
              </span>
              <h2 className="public-section-title mb-2">Find the type of equipment you need faster</h2>
              <p className="public-section-copy">
                The homepage category chips are derived from live inventory so the public site reflects the current marketplace.
              </p>
              <div className="row g-3 mt-1">
                {categoryCounts.length > 0 ? categoryCounts.map((item) => {
                  const matched = categoryOptions.find((entry) => entry.value === item.name);
                  const Icon = matched?.icon || FaCircleCheck;
                  return (
                    <div className="col-12 col-md-6" key={item.name}>
                      <Link className="public-category-card" to={`/equipment?category=${encodeURIComponent(item.name)}`}>
                        <div className="public-category-icon">
                          <Icon />
                        </div>
                        <div className="d-flex justify-content-between align-items-end gap-2">
                          <div>
                            <div className="fw-bold">{item.name}</div>
                            <div className="public-quiet-note small">{item.count} listings</div>
                          </div>
                          <FaArrowRight />
                        </div>
                      </Link>
                    </div>
                  );
                }) : (
                  <div className="col-12">
                    <div className="public-mini-card p-4">
                      <p className="mb-0 public-quiet-note">Category data will appear once equipment is available.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 col-xl-5">
              <div className="public-mini-card h-100">
                <span className="public-section-pill mb-3">
                  <FaClock />
                  Rental benefits
                </span>
                <h2 className="public-section-title mb-3">A commercial rental experience without the clutter</h2>
                <div className="d-grid gap-3">
                  {highlights.map((item) => (
                    <div className="d-flex gap-3" key={item.title}>
                      <div className="public-category-icon flex-shrink-0" style={{ width: 44, height: 44 }}>
                        <FaCircleCheck />
                      </div>
                      <div>
                        <div className="fw-bold">{item.title}</div>
                        <div className="public-quiet-note">{item.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="container-fluid">
          <div className="d-flex align-items-end justify-content-between gap-3 flex-wrap mb-4">
            <div>
              <span className="public-section-pill mb-3">
                <FaStar />
                Customer reviews
              </span>
              <h2 className="public-section-title mb-2">What renters say after using the platform</h2>
            </div>
            <Link className="btn btn-primary rounded-pill" to="/register">
              Create account
            </Link>
          </div>

          <div className="row g-4">
            {testimonials.map((item) => (
              <div className="col-12 col-md-6 col-xl-4" key={item.name}>
                <div className="public-testimonial">
                  <div className="public-testimonial-rating mb-3">
                    {Array.from({ length: item.rating }).map((_, index) => (
                      <FaStar key={index} />
                    ))}
                  </div>
                  <p className="mb-4">{item.quote}</p>
                  <div className="fw-bold">{item.name}</div>
                  <div className="public-quiet-note small">{item.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="container-fluid">
          <div className="public-cta-card">
            <div className="row align-items-center g-4">
              <div className="col-12 col-lg-8">
                <span className="public-section-pill mb-3">
                  <FaCalendarDays />
                  How it works
                </span>
                <h2 className="public-section-title text-white mb-2">Browse first, log in when you are ready to book.</h2>
                <p className="mb-0 text-white-50">
                  The public site is open for discovery. Booking, wishlist, chat, and reviews become available after authentication.
                </p>
              </div>
              <div className="col-12 col-lg-4 d-flex justify-content-lg-end gap-2 flex-wrap">
                <Link className="btn btn-light rounded-pill px-4" to="/equipment">
                  Explore equipment
                </Link>
                <Link className="btn btn-outline-light rounded-pill px-4" to="/login">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
