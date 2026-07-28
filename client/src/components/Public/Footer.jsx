import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter, FaYoutube } from "react-icons/fa6";

function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="public-footer">
      <div className="container-fluid">
        <div className="row g-4 g-lg-5">
          <div className="col-12 col-md-6 col-xl-4">
            <div className="d-flex align-items-center gap-3">
              <div className="public-brand-mark">
                <span>R</span>
              </div>
              <div>
                <div className="fw-bold fs-5">RentHub</div>
                <div className="public-quiet-note">Commercial equipment rental marketplace</div>
              </div>
            </div>
            <p className="public-footer-copy mt-3 mb-0">
              Discover verified equipment, compare pricing, and manage rentals in a clean customer journey built for real operations.
            </p>
            <div className="d-flex flex-wrap gap-2 mt-3">
              <a className="btn btn-light rounded-pill" href="https://facebook.com" onClick={(event) => event.preventDefault()}>
                <FaFacebookF />
              </a>
              <a className="btn btn-light rounded-pill" href="https://instagram.com" onClick={(event) => event.preventDefault()}>
                <FaInstagram />
              </a>
              <a className="btn btn-light rounded-pill" href="https://x.com" onClick={(event) => event.preventDefault()}>
                <FaXTwitter />
              </a>
              <a className="btn btn-light rounded-pill" href="https://linkedin.com" onClick={(event) => event.preventDefault()}>
                <FaLinkedinIn />
              </a>
              <a className="btn btn-light rounded-pill" href="https://youtube.com" onClick={(event) => event.preventDefault()}>
                <FaYoutube />
              </a>
            </div>
          </div>

          <div className="col-6 col-md-3 col-xl-2">
            <h6 className="public-footer-heading">Company</h6>
            <ul className="public-footer-links">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/how-it-works">How It Works</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="col-6 col-md-3 col-xl-2">
            <h6 className="public-footer-heading">Browse</h6>
            <ul className="public-footer-links">
              <li><Link to="/equipment">Equipment</Link></li>
              <li><Link to="/categories">Categories</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>

          <div className="col-12 col-md-6 col-xl-2">
            <h6 className="public-footer-heading">Popular Categories</h6>
            <ul className="public-footer-links">
              <li><Link to="/equipment?category=Construction">Construction</Link></li>
              <li><Link to="/equipment?category=Power Tools">Power Tools</Link></li>
              <li><Link to="/equipment?category=Events">Events</Link></li>
              <li><Link to="/equipment?category=Photography">Photography</Link></li>
            </ul>
          </div>

          <div className="col-12 col-md-6 col-xl-2">
            <h6 className="public-footer-heading">Contact</h6>
            <ul className="public-footer-links">
              <li><a href="mailto:support@renthub.com">support@renthub.com</a></li>
              <li><a href="tel:+911234567890">+91 12345 67890</a></li>
              <li><span>Goa, India</span></li>
            </ul>
          </div>
        </div>

        <div className="public-footer-bottom">
          <div>Copyright {year} RentHub. All rights reserved.</div>
          <div className="d-flex flex-wrap gap-3">
            <Link to="/equipment">Equipment</Link>
            <Link to="/contact">Support</Link>
            <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;
