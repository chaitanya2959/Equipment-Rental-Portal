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
              <li><Link to="/customer/about">About</Link></li>
              <li><Link to="/customer/contact">Contact</Link></li>
              <li><Link to="/customer/careers">Careers</Link></li>
              <li><Link to="/customer/blog">Blog</Link></li>
            </ul>
          </div>

          <div className="col-6 col-xl-3">
            <h6 className="customer-footer-heading">Categories</h6>
            <ul className="customer-footer-links">
              <li><Link to="/customer/equipment?category=construction">Construction</Link></li>
              <li><Link to="/customer/equipment?category=event">Event</Link></li>
              <li><Link to="/customer/equipment?category=household">Household</Link></li>
              <li><Link to="/customer/equipment?category=power-tools">Power Tools</Link></li>
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
            <Link to="/customer/privacy">Privacy</Link>
            <Link to="/customer/terms">Terms</Link>
            <Link to="/customer/support">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
