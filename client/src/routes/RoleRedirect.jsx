import { Navigate } from "react-router-dom";
import { dashboardPathForRole } from "../constants/roles";
import { useAuth } from "../context/AuthContext";

function RoleRedirect() {
  const { isAuthenticated, user } = useAuth();
  return <Navigate to={isAuthenticated ? dashboardPathForRole(user.role) : "/login"} replace />;
}

export default RoleRedirect;
