import { useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaArrowRight, FaBars, FaHouse, FaMapLocationDot, FaXmark } from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Equipment", to: "/equipment" },
  { label: "Categories", to: "/categories" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

function PublicNavbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = useMemo(() => {
    return (user?.name || "Guest")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.name]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky-top" style={{ zIndex: 1040 }}>
      <nav className="navbar navbar-expand-xl public-navbar">
        <div className="container-fluid px-3 px-lg-4">
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-light d-xl-none rounded-pill"
              type="button"
              onClick={() => setMobileOpen((current) => !current)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <FaXmark /> : <FaBars />}
            </button>
            <Link className="public-brand" to="/">
              <span className="public-brand-mark">
                <FaHouse />
              </span>
              <span className="public-brand-copy">
                <strong>RentHub</strong>
                <small>Equipment Rental Portal</small>
              </span>
            </Link>
          </div>

          <div className="d-none d-xl-flex align-items-center gap-3 flex-grow-1 justify-content-center">
            {navLinks.map((link) => (
              <NavLink
                className={({ isActive }) => `nav-link public-nav-link ${isActive ? "active" : ""}`.trim()}
                key={link.to}
                to={link.to}
                end={link.to === "/"}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="d-flex align-items-center gap-2">
            <Link className="btn btn-outline-primary rounded-pill d-none d-md-inline-flex public-nav-cta" to="/equipment">
              <FaMapLocationDot />
              Browse rentals
            </Link>
            {isAuthenticated ? (
              <>
                <Link className="btn btn-primary rounded-pill public-nav-cta" to={user?.role === "owner" ? "/owner/dashboard" : "/customer/dashboard"}>
                  Dashboard
                  <FaArrowRight />
                </Link>
                <button className="btn btn-light rounded-pill d-none d-sm-inline-flex" type="button" onClick={handleLogout}>
                  Logout {initials}
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-primary rounded-pill d-none d-sm-inline-flex" to="/login">
                  Login
                </Link>
                <Link className="btn btn-primary rounded-pill" to="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className={`collapse d-xl-none ${mobileOpen ? "show" : ""}`}>
        <div className="bg-white border-bottom shadow-sm">
          <div className="container-fluid py-3">
            <div className="d-grid gap-2">
              {navLinks.map((link) => (
                <NavLink
                  className={({ isActive }) => `btn btn-light text-start rounded-pill ${isActive ? "active" : ""}`.trim()}
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
              <Link className="btn btn-outline-primary rounded-pill" to="/equipment" onClick={() => setMobileOpen(false)}>
                Browse rentals
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    className="btn btn-primary rounded-pill"
                    to={user?.role === "owner" ? "/owner/dashboard" : "/customer/dashboard"}
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button className="btn btn-light rounded-pill" type="button" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link className="btn btn-outline-primary rounded-pill" to="/login" onClick={() => setMobileOpen(false)}>
                    Login
                  </Link>
                  <Link className="btn btn-primary rounded-pill" to="/register" onClick={() => setMobileOpen(false)}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default PublicNavbar;
