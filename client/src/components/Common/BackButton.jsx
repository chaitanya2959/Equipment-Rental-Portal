import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

function BackButton({ fallbackTo = -1, label = "Back", className = "" }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (typeof fallbackTo === "number") {
      navigate(fallbackTo);
      return;
    }

    navigate(fallbackTo || -1);
  };

  return (
    <button className={`btn btn-light rounded-pill ${className}`.trim()} type="button" onClick={handleClick}>
      <FaArrowLeft />
      <span>{label}</span>
    </button>
  );
}

export default BackButton;
