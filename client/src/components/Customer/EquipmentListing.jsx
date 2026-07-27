import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCircleNodes,
  FaFilter,
  FaHeart,
  FaMagnifyingGlass,
  FaSliders,
} from "react-icons/fa6";
import api from "../../services/api";
import EquipmentCard from "../cards/EquipmentCard";

const sortOptions = [
  "Latest",
  "Price: Low to High",
  "Price: High to Low",
  "Rating: High to Low",
];

const availabilityOptions = ["All", "Available", "Unavailable"];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(value);

function EquipmentListing() {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("All Locations");
  const [availability, setAvailability] = useState("All");
  const [sortBy, setSortBy] = useState("Latest");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    let isActive = true;

    const fetchEquipment = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/equipment");
        if (!isActive) return;
        setEquipments(response?.data?.data || []);
      } catch (fetchError) {
        if (!isActive) return;
        setError(
          fetchError?.response?.data?.message || fetchError.message || "Unable to load equipment.",
        );
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchEquipment();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, location, availability, sortBy]);

  const categoryOptions = useMemo(
    () => [
      "All Categories",
      ...Array.from(
        new Set(equipments.map((item) => item.category).filter(Boolean)),
      ),
    ],
    [equipments],
  );

  const locationOptions = useMemo(
    () => [
      "All Locations",
      ...Array.from(
        new Set(equipments.map((item) => item.location).filter(Boolean)),
      ),
    ],
    [equipments],
  );

  const filteredEquipment = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    let filtered = equipments.filter((item) => {
      const matchesName =
        !normalizedSearch || item.name?.toLowerCase().includes(normalizedSearch);
      const matchesCategory =
        category === "All Categories" || item.category === category;
      const matchesLocation =
        location === "All Locations" ||
        item.location?.toLowerCase().includes(location.toLowerCase());
      const matchesAvailability =
        availability === "All" ||
        (availability === "Available" &&
          (item.available === true || item.status === "Available")) ||
        (availability === "Unavailable" &&
          (item.available === false || item.status !== "Available"));

      return matchesName && matchesCategory && matchesLocation && matchesAvailability;
    });

    if (sortBy === "Price: Low to High") {
      filtered = [...filtered].sort((a, b) => (a.pricePerDay || 0) - (b.pricePerDay || 0));
    } else if (sortBy === "Price: High to Low") {
      filtered = [...filtered].sort((a, b) => (b.pricePerDay || 0) - (a.pricePerDay || 0));
    } else if (sortBy === "Rating: High to Low") {
      filtered = [...filtered].sort(
        (a, b) => (b.averageRating ?? b.rating ?? 0) - (a.averageRating ?? a.rating ?? 0),
      );
    } else {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt),
      );
    }

    return filtered;
  }, [equipments, search, category, location, availability, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredEquipment.length / pageSize));
  const visibleEquipment = filteredEquipment.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("All Categories");
    setLocation("All Locations");
    setAvailability("All");
    setSortBy("Latest");
    setCurrentPage(1);
  };

  const handleWishlist = (equipment) => {
    console.info("Wishlist clicked for", equipment._id || equipment.id);
  };

  return (
    <div className="customer-equipment-page">
      <section className="equipment-hero card border-0">
        <div className="card-body p-4 p-lg-5">
          <div className="row align-items-center g-4">
            <div className="col-12 col-xl-7">
              <p className="eyebrow mb-2">Equipment listing</p>
              <h1 className="page-title mb-3">
                Browse verified rental equipment from our live inventory.
              </h1>
              <p className="page-subtitle mb-0">
                Search, filter, sort and compare every approved item from your owner network.
              </p>
            </div>
            <div className="col-12 col-xl-5">
              <div className="equipment-hero-stats">
                <div className="equipment-hero-stat">
                  <FaCircleNodes />
                  <div>
                    <strong>{equipments.length}</strong>
                    <span>Live listings</span>
                  </div>
                </div>
                <div className="equipment-hero-stat">
                  <FaFilter />
                  <div>
                    <strong>Refine fast</strong>
                    <span>Search by name, category, location</span>
                  </div>
                </div>
                <div className="equipment-hero-stat">
                  <FaSliders />
                  <div>
                    <strong>Smart filters</strong>
                    <span>Sorted for confident bookings</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="equipment-filters card border-0 mt-4">
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-12 col-lg-4">
              <label className="form-label fw-semibold">Search by name</label>
              <div className="input-group equipment-input">
                <span className="input-group-text">
                  <FaMagnifyingGlass />
                </span>
                <input
                  className="form-control"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search equipment by name"
                  type="search"
                  value={search}
                />
              </div>
            </div>
            <div className="col-6 col-lg-2">
              <label className="form-label fw-semibold">Category</label>
              <select
                className="form-select equipment-select"
                onChange={(event) => setCategory(event.target.value)}
                value={category}
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-lg-2">
              <label className="form-label fw-semibold">Location</label>
              <select
                className="form-select equipment-select"
                onChange={(event) => setLocation(event.target.value)}
                value={location}
              >
                {locationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-lg-2">
              <label className="form-label fw-semibold">Availability</label>
              <select
                className="form-select equipment-select"
                onChange={(event) => setAvailability(event.target.value)}
                value={availability}
              >
                {availabilityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-lg-2">
              <label className="form-label fw-semibold">Sort</label>
              <select
                className="form-select equipment-select"
                onChange={(event) => setSortBy(event.target.value)}
                value={sortBy}
              >
                {sortOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 d-flex flex-wrap gap-2 justify-content-between align-items-center">
              <div className="equipment-result-count">
                <FaFilter />
                <span>{filteredEquipment.length} equipment found</span>
              </div>
              <button
                className="btn btn-outline-secondary rounded-pill"
                type="button"
                onClick={resetFilters}
              >
                <FaSliders />
                <span>Reset filters</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading equipment...</span>
            </div>
            <p className="mt-3 mb-0">Loading equipment from the backend...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : visibleEquipment.length ? (
          <div className="row g-4">
            {visibleEquipment.map((item) => (
              <EquipmentCard
                key={item._id || item.id}
                equipment={item}
                detailsUrl={`/customer/equipment/${item._id || item.id}`}
                bookUrl={`/customer/equipment/${item._id || item.id}?book=1`}
                onAddToWishlist={handleWishlist}
              />
            ))}
          </div>
        ) : (
          <div className="card border-0 equipment-empty">
            <div className="card-body p-5 text-center">
              <div className="equipment-empty-icon">
                <FaCircleNodes />
              </div>
              <h3 className="h5 fw-bold mb-2">No equipment found</h3>
              <p className="text-muted mb-3">
                Try adjusting filters, search terms, or checking back after new owner equipment is added.
              </p>
              <button className="btn btn-primary rounded-pill px-4" type="button" onClick={resetFilters}>
                Reset filters
              </button>
            </div>
          </div>
        )}
      </section>

      {!loading && !error && filteredEquipment.length > 0 ? (
        <section className="equipment-pagination-wrap mt-4">
          <nav aria-label="Equipment pagination">
            <ul className="pagination pagination-lg justify-content-center flex-wrap">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" type="button" onClick={() => goToPage(currentPage - 1)}>
                  Previous
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <li className={`page-item ${currentPage === page ? "active" : ""}`} key={page}>
                  <button className="page-link" type="button" onClick={() => goToPage(page)}>
                    {page}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" type="button" onClick={() => goToPage(currentPage + 1)}>
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </section>
      ) : null}
    </div>
  );
}

export default EquipmentListing;
