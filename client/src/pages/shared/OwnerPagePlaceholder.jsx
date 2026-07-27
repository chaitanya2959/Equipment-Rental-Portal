import { FaWandMagicSparkles } from "react-icons/fa6";

function OwnerPagePlaceholder({ title }) {
  return (
    <section className="card border-0">
      <div className="card-body p-4 p-lg-5">
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="section-icon bg-primary-subtle text-primary">
            <FaWandMagicSparkles />
          </div>
          <div>
            <p className="eyebrow mb-1">Owner workspace</p>
            <h1 className="page-title mb-0">{title}</h1>
          </div>
        </div>
        <p className="page-subtitle mb-0">This area is ready for a premium owner experience.</p>
      </div>
    </section>
  );
}
export default OwnerPagePlaceholder;
