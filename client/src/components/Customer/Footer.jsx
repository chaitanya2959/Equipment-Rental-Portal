import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter, FaYoutube } from "react-icons/fa6";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="customer-footer">
      <div className="container-fluid">
        <div className="row g-4 g-lg-5">
          <div className="col-12 col-md-6 col-xl-3">
            <div className="customer-footer-brand">
              <div className="customer-brand-mark">R</div>
              <div>
                <div className="customer-footer-title">RentHub</div>
                <div className="customer-footer-subtitle">Equipment Rental Portal</div>
              </div>
            </div>
            <p className="customer-footer-copy mt-3">
              Premium equipment rental experience built for fast discovery, reliable bookings and a clean customer journey.
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

          <div className="col-6 col-xl-2">
            <h6 className="customer-footer-heading">Company</h6>
            <ul className="customer-footer-links">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/how-it-works">How It Works</Link></li>
              <li><Link to="/categories">Categories</Link></li>
            </ul>
          </div>

          <div className="col-6 col-xl-3">
            <h6 className="customer-footer-heading">Categories</h6>
            <ul className="customer-footer-links">
              <li><Link to="/equipment?category=Construction">Construction</Link></li>
              <li><Link to="/equipment?category=Events">Events</Link></li>
              <li><Link to="/equipment?category=Home Care">Home Care</Link></li>
              <li><Link to="/equipment?category=Power Tools">Power Tools</Link></li>
            </ul>
          </div>

          <div className="col-6 col-xl-2">
            <h6 className="customer-footer-heading">Quick Links</h6>
            <ul className="customer-footer-links">
              <li><Link to="/customer/dashboard">Dashboard</Link></li>
              <li><Link to="/customer/wishlist">Wishlist</Link></li>
              <li><Link to="/customer/bookings">Bookings</Link></li>
              <li><Link to="/customer/profile">Profile</Link></li>
            </ul>
          </div>

          <div className="col-6 col-xl-2">
            <h6 className="customer-footer-heading">Contact</h6>
            <ul className="customer-footer-links">
              <li><a href="mailto:support@renthub.com">support@renthub.com</a></li>
              <li><a href="tel:+911234567890">+91 12345 67890</a></li>
              <li><span>Hyderabad, India</span></li>
            </ul>
          </div>
        </div>

        <div className="customer-footer-bottom">
          <div>© {currentYear} RentHub. All rights reserved.</div>
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
