import { FaArrowLeft } from "react-icons/fa6";
import { Link } from "react-router-dom";

function EmptyState({ listingUrl }) {
  return (
    <div className="equipment-state">
      <div className="equipment-state-icon">
        <FaArrowLeft />
      </div>
      <h1 className="equipment-state-title">Equipment Not Found</h1>
      <p className="equipment-state-copy mb-0">
        The requested listing is no longer available in the database.
      </p>
      <Link className="btn btn-outline-primary rounded-pill px-4" to={listingUrl}>
        Return to Equipment Listing
      </Link>
    </div>
  );
}

export default EmptyState;
