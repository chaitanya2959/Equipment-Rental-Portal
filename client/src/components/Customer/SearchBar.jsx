import { FaMagnifyingGlass } from "react-icons/fa6";

function SearchBar({
  className = "",
  placeholder = "Search equipment, bookings, categories...",
  value = "",
  onChange,
  onSubmit,
}) {
  return (
    <form className={`customer-searchbar ${className}`.trim()} onSubmit={onSubmit}>
      <FaMagnifyingGlass className="customer-searchbar-icon" />
      <input
        aria-label="Search"
        className="customer-searchbar-input"
        onChange={onChange}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </form>
  );
}

export default SearchBar;
