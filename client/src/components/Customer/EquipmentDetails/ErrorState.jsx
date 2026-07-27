import { FaArrowRotateRight, FaTriangleExclamation } from "react-icons/fa6";

function ErrorState({ message, onRetry }) {
  return (
    <div className="equipment-state equipment-state--error">
      <div className="equipment-state-icon equipment-state-icon--error">
        <FaTriangleExclamation />
      </div>
      <h1 className="equipment-state-title">Unable to load equipment.</h1>
      <p className="equipment-state-copy mb-0">{message}</p>
      <button className="btn btn-primary rounded-pill px-4" type="button" onClick={onRetry}>
        <FaArrowRotateRight />
        <span>Try Again</span>
      </button>
    </div>
  );
}

export default ErrorState;
