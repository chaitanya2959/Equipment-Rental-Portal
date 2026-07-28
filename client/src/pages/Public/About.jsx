import { Link } from "react-router-dom";
import { FaArrowRight, FaShieldHeart, FaStar, FaTruckFast } from "react-icons/fa6";

const points = [
  {
    title: "Built for serious rental workflows",
    text: "The public site is designed to feel like a commercial rental marketplace with clear pricing and discovery.",
  },
  {
    title: "Keeps the backend untouched",
    text: "The new experience uses the existing API surface, routes, and authentication logic.",
  },
  {
    title: "Same theme, better structure",
    text: "The visual language stays aligned while the public funnel becomes easier to understand.",
  },
];

function About() {
  return (
    <div className="public-section">
      <div className="container-fluid">
        <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap mb-4">
          <div>
            <span className="public-section-pill mb-3">
              <FaShieldHeart />
              About
            </span>
            <h1 className="public-section-title mb-2">A rental platform with a public storefront and a clean customer workspace.</h1>
            <p className="public-section-copy mb-0">
              RentHub separates discovery from booking so visitors can browse equipment before they sign in.
            </p>
          </div>
          <Link className="btn btn-primary rounded-pill" to="/equipment">
            Browse equipment
            <FaArrowRight />
          </Link>
        </div>

        <div className="row g-4">
          <div className="col-12 col-xl-7">
            <div className="public-surface-card p-4 p-lg-5 h-100">
              <h2 className="h4 fw-bold mb-3">What this experience is for</h2>
              <p className="public-quiet-note">
                The current frontend was turned into a marketplace-style experience with public landing pages, equipment discovery, and customer-only booking flows.
              </p>
              <div className="d-grid gap-3 mt-4">
                {points.map((item) => (
                  <div className="public-mini-card" key={item.title}>
                    <div className="d-flex align-items-start gap-3">
                      <div className="public-category-icon flex-shrink-0">
                        <FaStar />
                      </div>
                      <div>
                        <div className="fw-bold">{item.title}</div>
                        <div className="public-quiet-note">{item.text}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-5">
            <div className="public-surface-card p-4 p-lg-5 h-100">
              <h2 className="h4 fw-bold mb-3">Marketplace focus</h2>
              <div className="d-grid gap-3">
                <div className="public-mini-card">
                  <FaTruckFast className="text-primary mb-2" />
                  <div className="fw-bold">Equipment first</div>
                  <div className="public-quiet-note">Categories, filters, and detail views are optimized for product discovery.</div>
                </div>
                <div className="public-mini-card">
                  <FaShieldHeart className="text-primary mb-2" />
                  <div className="fw-bold">Customer safety</div>
                  <div className="public-quiet-note">Booking, wishlist, chat, and review actions are protected until login.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
