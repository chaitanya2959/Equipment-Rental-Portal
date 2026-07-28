import { Link } from "react-router-dom";
import { FaArrowRight, FaCalendarDays, FaCreditCard, FaMagnifyingGlass, FaTruckFast } from "react-icons/fa6";

const steps = [
  {
    title: "Search",
    icon: FaMagnifyingGlass,
    text: "Browse the catalog, filter by category and location, and inspect equipment details before login.",
  },
  {
    title: "Sign in",
    icon: FaCreditCard,
    text: "Login or register only when you are ready to book, save, chat, or review.",
  },
  {
    title: "Book",
    icon: FaCalendarDays,
    text: "Pick dates, review the summary, and confirm the booking with a professional success page.",
  },
  {
    title: "Pickup and return",
    icon: FaTruckFast,
    text: "Follow live reminders for pickup and return windows after the booking is approved.",
  },
];

function HowItWorks() {
  return (
    <div className="public-section">
      <div className="container-fluid">
        <div className="d-flex align-items-end justify-content-between gap-3 flex-wrap mb-4">
          <div>
            <span className="public-section-pill mb-3">
              <FaCalendarDays />
              How it works
            </span>
            <h1 className="public-section-title mb-2">A simple flow from discovery to booking.</h1>
            <p className="public-section-copy mb-0">Public visitors browse freely, then move into authentication only when an action requires it.</p>
          </div>
          <Link className="btn btn-primary rounded-pill" to="/register">
            Create account
            <FaArrowRight />
          </Link>
        </div>

        <div className="row g-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div className="col-12 col-md-6 col-xl-3" key={step.title}>
                <div className="public-step h-100">
                  <div className="public-step-number mb-3">0{index + 1}</div>
                  <div className="public-category-icon mb-3">
                    <Icon />
                  </div>
                  <div className="fw-bold fs-5 mb-2">{step.title}</div>
                  <div className="public-quiet-note">{step.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;
