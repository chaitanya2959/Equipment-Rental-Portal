import { FaBolt } from "react-icons/fa6";

function DashboardPlaceholder({ role }) {
  return (
    <section className="card border-0">
      <div className="card-body p-4 p-lg-5">
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="section-icon bg-primary-subtle text-primary">
            <FaBolt />
          </div>
          <div>
            <p className="eyebrow mb-1">{role} workspace</p>
            <h1 className="page-title mb-0">Welcome to your dashboard</h1>
          </div>
        </div>
        <p className="page-subtitle mb-0">
          Your workspace is ready. This screen will receive the full premium dashboard layout in the next iteration.
        </p>
      </div>
    </section>
  );
}
export default DashboardPlaceholder;
