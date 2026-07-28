import { Outlet } from "react-router-dom";
import PublicFooter from "../components/Public/Footer";
import PublicNavbar from "../components/Public/Navbar";

function PublicLayout() {
  return (
    <div className="public-shell d-flex flex-column min-vh-100">
      <PublicNavbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}

export default PublicLayout;
