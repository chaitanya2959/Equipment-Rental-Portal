import { Link } from "react-router-dom";
import { FaArrowRight, FaCamera, FaHouse, FaLeaf, FaMusic, FaShieldHeart, FaTruckFast, FaWrench } from "react-icons/fa6";

const categories = [
  { label: "Construction", icon: FaTruckFast, slug: "Construction", note: "Tools for site work and heavy lifting." },
  { label: "Power Tools", icon: FaWrench, slug: "Power Tools", note: "Drills, cutters, and jobsite-ready tools." },
  { label: "Events", icon: FaMusic, slug: "Events", note: "Audio, staging, and event utilities." },
  { label: "Photography", icon: FaCamera, slug: "Photography", note: "Capture gear and production equipment." },
  { label: "Home Care", icon: FaHouse, slug: "Home Care", note: "Cleaning, maintenance, and home helpers." },
  { label: "Garden", icon: FaLeaf, slug: "Garden", note: "Outdoor care and landscaping tools." },
  { label: "Safety Gear", icon: FaShieldHeart, slug: "Safety Gear", note: "Protective equipment for controlled usage." },
];

function Categories() {
  return (
    <div className="public-section">
      <div className="container-fluid">
        <div className="d-flex align-items-end justify-content-between gap-3 flex-wrap mb-4">
          <div>
            <span className="public-section-pill mb-3">
              <FaShieldHeart />
              Categories
            </span>
            <h1 className="public-section-title mb-2">Browse equipment by category</h1>
            <p className="public-section-copy mb-0">
              Use categories to jump into a narrower equipment list and reduce the time it takes to find the right item.
            </p>
          </div>
          <Link className="btn btn-primary rounded-pill" to="/equipment">
            View equipment
            <FaArrowRight />
          </Link>
        </div>

        <div className="row g-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div className="col-12 col-md-6 col-xl-4" key={category.slug}>
                <Link className="public-category-card" to={`/equipment?category=${encodeURIComponent(category.slug)}`}>
                  <div className="public-category-icon">
                    <Icon />
                  </div>
                  <div className="fw-bold fs-5">{category.label}</div>
                  <div className="public-quiet-note">{category.note}</div>
                  <div className="mt-auto fw-semibold text-primary">Open category</div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Categories;
