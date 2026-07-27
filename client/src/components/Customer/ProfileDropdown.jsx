import { Link } from "react-router-dom";
import {
  FaArrowRightFromBracket,
  FaCalendarDays,
  FaHeart,
  FaRegCircleUser,
} from "react-icons/fa6";

function ProfileDropdown({ isOpen, user, onLogout }) {
  const initials = (user?.name || "Customer")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`customer-dropdown customer-profile-dropdown ${isOpen ? "show" : ""}`}>
      <div className="customer-profile-summary">
        <div className="customer-profile-avatar">
          {user?.avatar ? <img alt={user?.name || "Customer"} src={user.avatar} /> : <span>{initials}</span>}
        </div>
        <div className="min-w-0">
          <div className="customer-profile-name">{user?.name || "Guest Customer"}</div>
          <div className="customer-profile-email">{user?.email || "guest@renthub.com"}</div>
          <span className="customer-role-badge">{user?.role || "Customer"}</span>
        </div>
      </div>

      <div className="customer-dropdown-menu">
        <Link className="customer-dropdown-link" to="/customer/profile">
          <FaRegCircleUser />
          <span>Profile</span>
        </Link>
        <Link className="customer-dropdown-link" to="/customer/bookings">
          <FaCalendarDays />
          <span>Bookings</span>
        </Link>
        <Link className="customer-dropdown-link" to="/customer/wishlist">
          <FaHeart />
          <span>Wishlist</span>
        </Link>
      </div>

      <div className="customer-dropdown-footer">
        <button className="btn btn-outline-danger rounded-pill" type="button" onClick={onLogout}>
          <FaArrowRightFromBracket />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default ProfileDropdown;
