import { FaMagnifyingGlass } from "react-icons/fa6";

function SearchBar({ value, onChange, placeholder = "Search equipment, bookings...", className = "" }) {
  return (
    <div className={`owner-searchbar ${className}`.trim()}>
      <FaMagnifyingGlass className="owner-searchbar-icon" aria-hidden="true" />
      <input
        type="search"
        className="owner-searchbar-input"
        placeholder={placeholder}
        aria-label={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export default SearchBar;
