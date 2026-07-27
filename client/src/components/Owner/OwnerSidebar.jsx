import { NavLink } from "react-router-dom";
import {
  FaArrowRightFromBracket, FaBell, FaBoxOpen, FaCalendarCheck, FaCirclePlus,
  FaClockRotateLeft, FaGaugeHigh, FaGear, FaIndianRupeeSign, FaStar, FaTruckFast,
  FaUser, FaXmark,
} from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  ["Dashboard", "/owner/dashboard", FaGaugeHigh],
  ["My Equipment", "/owner/equipment", FaBoxOpen],
  ["Add Equipment", "/owner/equipment/new", FaCirclePlus],
  ["Booking Requests", "/owner/booking-requests", FaCalendarCheck],
  ["Current Rentals", "/owner/current-rentals", FaTruckFast],
  ["Rental History", "/owner/rental-history", FaClockRotateLeft],
  ["Earnings", "/owner/earnings", FaIndianRupeeSign],
  ["Reviews", "/owner/reviews", FaStar],
  ["Notifications", "/owner/notifications", FaBell],
  ["Profile", "/owner/profile", FaUser],
  ["Settings", "/owner/settings", FaGear],
];

function OwnerSidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  return <>
    <button aria-label="Close navigation" className={`owner-sidebar-backdrop ${isOpen ? "show" : ""}`} onClick={onClose} type="button" />
    <aside className={`owner-sidebar ${isOpen ? "open" : ""}`}>
      <div className="owner-sidebar-brand d-flex align-items-center justify-content-between">
        <NavLink className="text-decoration-none" to="/owner/dashboard" onClick={onClose}><span className="brand-mark">R</span><span>RentHub</span></NavLink>
        <button aria-label="Close navigation" className="btn btn-sm btn-link text-white d-lg-none" onClick={onClose} type="button"><FaXmark /></button>
      </div>
      <nav aria-label="Owner navigation" className="owner-nav flex-grow-1">
        <p className="owner-nav-label">Owner workspace</p>
        {menuItems.map(([label, path, Icon]) => <NavLink className="owner-nav-link" key={path} onClick={onClose} to={path}><Icon aria-hidden="true" /><span>{label}</span>{label === "Notifications" && <span className="notification-dot" />}</NavLink>)}
      </nav>
      <div className="owner-sidebar-footer">
        <button className="owner-nav-link w-100 border-0 bg-transparent" onClick={logout} type="button"><FaArrowRightFromBracket aria-hidden="true" /><span>Logout</span></button>
      </div>
    </aside>
  </>;
}

export default OwnerSidebar;
