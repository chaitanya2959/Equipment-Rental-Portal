import { Outlet } from "react-router-dom";
import AppHeader from "../components/common/AppHeader";

function DashboardLayout({ roleLabel }) {
  return (
    <div className="min-vh-100 d-flex flex-column app-shell">
      <AppHeader />
      <main className="container-fluid app-content flex-grow-1">
        <div className="app-page-header">
          <p className="eyebrow mb-2">{roleLabel} portal</p>
          <h1 className="page-title mb-2">{roleLabel} workspace</h1>
          <p className="page-subtitle mb-0">
            A calm, premium workspace for managing your daily operations with clarity.
          </p>
        </div>
        <Outlet />
      </main>
      <footer className="app-footer text-center small">© {new Date().getFullYear()} RentHub</footer>
    </div>
  );
}

export default DashboardLayout;
