import { Link } from "react-router-dom";
import { FaCircleUser, FaMagnifyingGlass, FaRightFromBracket } from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";

function AppHeader() {
  const { user, logout } = useAuth();
  return (
    <header className="app-header">
      <Link className="app-header-brand text-decoration-none" to="/">
        <span className="app-brand-mark">R</span>
        <span>RentHub</span>
      </Link>
      <div className="app-header-search d-none d-md-flex">
        <FaMagnifyingGlass aria-hidden="true" />
        <input aria-label="Search" placeholder="Search equipment, bookings..." type="search" />
      </div>
      <div className="d-flex align-items-center gap-2 gap-md-3 ms-auto">
        <button className="btn btn-light d-md-none" type="button" aria-label="Search">
          <FaMagnifyingGlass />
        </button>
        <div className="app-header-profile">
          <span className="owner-avatar">
            {user?.profileImage ? <img src={user.profileImage} alt={user?.name || "Owner"} /> : <FaCircleUser />}
          </span>
          <span className="d-none d-sm-flex flex-column text-start">
            <strong>{user?.name || user?.role || "Member"}</strong>
            <small className="text-muted text-capitalize">{user?.role || "user"}</small>
          </span>
        </div>
        <button className="btn btn-outline-secondary d-none d-md-inline-flex align-items-center gap-2" onClick={logout} type="button">
          <FaRightFromBracket aria-hidden="true" /> Sign out
        </button>
        <button className="btn btn-light d-md-none" onClick={logout} type="button" aria-label="Sign out">
          <FaRightFromBracket aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
