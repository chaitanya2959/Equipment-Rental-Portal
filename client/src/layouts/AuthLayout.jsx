import { Link } from "react-router-dom";
import { FaBolt, FaCameraRetro, FaToolbox, FaTractor, FaTruckFast, FaWrench } from "react-icons/fa6";
import "./auth.css";

const featureCards = [
  { title: "Verified Owners", text: "Quality-controlled rentals from trusted equipment partners.", icon: FaToolbox },
  { title: "Secure Booking", text: "Protected flows for reservations, reminders, and follow-ups.", icon: FaTruckFast },
  { title: "Easy Payments", text: "Simple rental payments for a smoother customer journey.", icon: FaBolt },
];

const floatingTiles = [
  { label: "Construction Equipment", hint: "Heavy-duty rentals", className: "auth-float-one" },
  { label: "Camera", hint: "Production-ready", className: "auth-float-two" },
  { label: "Generator", hint: "Power backup", className: "auth-float-three" },
];

function AuthLayout({ title, subtitle, children, footer, mode = "login" }) {
  const isRegister = mode === "register";

  return (
    <main className="auth-shell">
      <div className="container-fluid auth-grid">
        <div className="row g-0 min-vh-100">
          <div className="col-lg-7 d-none d-lg-flex auth-hero">
            <div className="auth-hero-inner">
              <span className="auth-kicker">
                <FaCameraRetro aria-hidden="true" />
                {isRegister ? "Create your account" : "Welcome back"}
              </span>
              <h1>Rent Equipment Anytime, Anywhere</h1>
              <p>Secure, fast and reliable equipment rental platform.</p>

              <div className="auth-feature-grid">
                {featureCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <article className="auth-feature-card" key={card.title}>
                      <span className="auth-feature-icon">
                        <Icon aria-hidden="true" />
                      </span>
                      <strong>{card.title}</strong>
                      <span>{card.text}</span>
                    </article>
                  );
                })}
              </div>

              <div className="auth-illustration">
                <div className="auth-illustration-grid">
                  <div className="auth-illustration-main">
                    <span className="auth-illustration-tag">
                      <FaTractor aria-hidden="true" />
                      Rental concept
                    </span>
                    <div className="auth-illustration-title">Premium marketplace experience</div>
                    <div className="auth-illustration-copy">
                      Browse construction equipment, cameras, generators, tractors and tools in a premium rental flow.
                    </div>
                  </div>
                  <div className="auth-illustration-stack">
                    <div className="auth-float-tile">
                      <FaTruckFast aria-hidden="true" />
                      <strong>Tools</strong>
                      <small>Ready to rent</small>
                    </div>
                    {floatingTiles.map((tile) => (
                      <div className={`auth-float-tile ${tile.className}`} key={tile.label}>
                        <FaWrench aria-hidden="true" />
                        <strong>{tile.label}</strong>
                        <small>{tile.hint}</small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-5 auth-card-shell">
            <section className="card auth-card border-0">
              <div className="auth-card-glow" aria-hidden="true" />
              <div className="auth-card-body position-relative">
                <Link className="auth-brand text-decoration-none mb-4" to="/">
                  <span className="auth-brand-icon">
                    <FaToolbox aria-hidden="true" />
                  </span>
                  <span>RentHub</span>
                </Link>
                <h1 className="fw-bold mb-2">{title}</h1>
                {subtitle && <p className="text-secondary mb-4">{subtitle}</p>}
                {children}
                {footer && <div className="text-center small mt-4 auth-footer-note">{footer}</div>}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AuthLayout;
