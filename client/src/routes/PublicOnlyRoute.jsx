import { Navigate, Outlet } from "react-router-dom";
import { dashboardPathForRole } from "../constants/roles";
import { useAuth } from "../context/AuthContext";

function PublicOnlyRoute() {
  const { isAuthenticated, user } = useAuth();
  return isAuthenticated ? <Navigate to={dashboardPathForRole(user.role)} replace /> : <Outlet />;
}

export default PublicOnlyRoute;
