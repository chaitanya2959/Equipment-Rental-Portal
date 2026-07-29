import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
  FaArrowRight,
} from "react-icons/fa6";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="customer-footer">
      <div className="container-fluid px-3 px-xxl-4">
        <div className="customer-footer-grid">
          <div>
            <div className="customer-footer-brand">
              <div className="customer-brand-mark">R</div>
              <div>
                <div className="customer-footer-title">RentHub</div>
                <div className="customer-footer-subtitle">Equipment Rental Portal</div>
              </div>
            </div>
            <p className="customer-footer-copy mt-3">
              A polished customer experience for discovering equipment, tracking bookings, and staying connected with owners.
            </p>
            <div className="customer-socials">
              <a aria-label="Facebook" href="/" onClick={(event) => event.preventDefault()}>
                <FaFacebookF />
              </a>
              <a aria-label="Instagram" href="/" onClick={(event) => event.preventDefault()}>
                <FaInstagram />
              </a>
              <a aria-label="X" href="/" onClick={(event) => event.preventDefault()}>
                <FaXTwitter />
              </a>
              <a aria-label="LinkedIn" href="/" onClick={(event) => event.preventDefault()}>
                <FaLinkedinIn />
              </a>
              <a aria-label="YouTube" href="/" onClick={(event) => event.preventDefault()}>
                <FaYoutube />
              </a>
            </div>
          </div>

          <div>
            <h6 className="customer-footer-heading">Explore</h6>
            <ul className="customer-footer-links">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/how-it-works">How It Works</Link></li>
              <li><Link to="/categories">Categories</Link></li>
            </ul>
          </div>

          <div>
            <h6 className="customer-footer-heading">Customer</h6>
            <ul className="customer-footer-links">
              <li><Link to="/customer/dashboard">Dashboard</Link></li>
              <li><Link to="/customer/equipment">Equipment</Link></li>
              <li><Link to="/customer/bookings">Bookings</Link></li>
              <li><Link to="/customer/wishlist">Wishlist</Link></li>
            </ul>
          </div>

          <div>
            <h6 className="customer-footer-heading">Categories</h6>
            <ul className="customer-footer-links">
              <li><Link to="/equipment?category=Construction">Construction</Link></li>
              <li><Link to="/equipment?category=Events">Events</Link></li>
              <li><Link to="/equipment?category=Home Care">Home Care</Link></li>
              <li><Link to="/equipment?category=Power Tools">Power Tools</Link></li>
            </ul>
          </div>

          <div className="customer-footer-cta">
            <div className="customer-footer-banner">
              <div className="customer-footer-banner-title">Need equipment fast?</div>
              <p className="customer-footer-banner-copy mb-3">
                Search the live marketplace and book verified equipment in minutes.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Link className="btn btn-light rounded-pill" to="/customer/equipment">
                  Browse catalog
                </Link>
                <Link className="btn btn-outline-light rounded-pill" to="/customer/bookings">
                  <FaArrowRight />
                  Track bookings
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="customer-footer-bottom">
          <div>(c) {currentYear} RentHub. All rights reserved.</div>
          <div className="customer-footer-bottom-links">
            <Link to="/about">Privacy</Link>
            <Link to="/contact">Terms</Link>
            <Link to="/contact">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
