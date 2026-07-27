import { Link } from "react-router-dom";
import { FaToolbox } from "react-icons/fa6";

function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="auth-page d-flex align-items-center py-4 py-lg-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-sm-11 col-md-9 col-lg-6 col-xl-5">
            <section className="card auth-card border-0 shadow-lg">
              <div className="card-body p-4 p-md-5">
                <Link className="auth-brand text-decoration-none d-inline-flex align-items-center gap-2 mb-4" to="/login">
                  <span className="auth-brand-icon"><FaToolbox aria-hidden="true" /></span>
                  <span>RentHub</span>
                </Link>
                <h1 className="h2 fw-bold mb-2">{title}</h1>
                {subtitle && <p className="text-secondary mb-4">{subtitle}</p>}
                {children}
                {footer && <div className="text-center text-secondary small mt-4">{footer}</div>}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AuthLayout;
