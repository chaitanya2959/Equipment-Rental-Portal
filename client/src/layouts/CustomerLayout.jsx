import { Outlet } from "react-router-dom";
import CustomerFooter from "../components/Customer/Footer";
import CustomerNavbar from "../components/Customer/Navbar";
import "../components/Customer/customer-layout.css";

function CustomerLayout() {
  return (
    <div className="customer-shell d-flex flex-column min-vh-100">
      <CustomerNavbar />
      <main className="customer-main flex-grow-1">
        <Outlet />
      </main>
      <CustomerFooter />
    </div>
  );
}

export default CustomerLayout;
