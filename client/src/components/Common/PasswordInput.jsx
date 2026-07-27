import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

function PasswordInput({ id, label = "Password", error, ...inputProps }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="mb-3">
      <label className="form-label fw-medium" htmlFor={id}>{label}</label>
      <div className="input-group">
        <input id={id} className={`form-control ${error ? "is-invalid" : ""}`} type={visible ? "text" : "password"} {...inputProps} />
        <button aria-label={visible ? "Hide password" : "Show password"} className="btn btn-outline-secondary" onClick={() => setVisible(!visible)} type="button">
          {visible ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
        </button>
      </div>
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
}

export default PasswordInput;
