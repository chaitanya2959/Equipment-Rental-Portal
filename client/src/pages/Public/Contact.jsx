import { Link } from "react-router-dom";
import { FaEnvelope, FaLocationDot, FaPhone, FaMessage } from "react-icons/fa6";

function Contact() {
  return (
    <div className="public-section">
      <div className="container-fluid">
        <div className="row g-4">
          <div className="col-12 col-xl-5">
            <span className="public-section-pill mb-3">
              <FaMessage />
              Contact
            </span>
            <h1 className="public-section-title mb-2">Talk to the team behind the marketplace.</h1>
            <p className="public-section-copy">
              Use the contact details below for support, rentals, or account issues. The site is ready for browsing without forcing login.
            </p>

            <div className="d-grid gap-3 mt-4">
              <div className="public-contact-card">
                <div className="d-flex align-items-center gap-3">
                  <div className="public-category-icon">
                    <FaEnvelope />
                  </div>
                  <div>
                    <div className="fw-bold">Email</div>
                    <a href="mailto:support@renthub.com">support@renthub.com</a>
                  </div>
                </div>
              </div>
              <div className="public-contact-card">
                <div className="d-flex align-items-center gap-3">
                  <div className="public-category-icon">
                    <FaPhone />
                  </div>
                  <div>
                    <div className="fw-bold">Phone</div>
                    <a href="tel:+911234567890">+91 12345 67890</a>
                  </div>
                </div>
              </div>
              <div className="public-contact-card">
                <div className="d-flex align-items-center gap-3">
                  <div className="public-category-icon">
                    <FaLocationDot />
                  </div>
                  <div>
                    <div className="fw-bold">Location</div>
                    <span>Goa, India</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-7">
            <div className="public-form-panel">
              <h2 className="h4 fw-bold mb-3">Send an inquiry</h2>
              <p className="public-quiet-note">
                This frontend-only contact form is designed as a handoff point to email or support.
              </p>
              <form className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Name</label>
                  <input className="form-control" placeholder="Your name" type="text" />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Email</label>
                  <input className="form-control" placeholder="you@example.com" type="email" />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Message</label>
                  <textarea className="form-control" rows="6" placeholder="Tell us what you need..." />
                </div>
                <div className="col-12 d-flex flex-wrap gap-2">
                  <Link className="btn btn-primary rounded-pill" to="/login">
                    Login for support
                  </Link>
                  <a className="btn btn-outline-primary rounded-pill" href="mailto:support@renthub.com">
                    Email support
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
