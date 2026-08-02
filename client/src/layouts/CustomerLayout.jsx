import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import CustomerFooter from "../components/Customer/Footer";
import CustomerNavbar from "../components/Customer/Navbar";
import CustomerSidebar from "../components/Customer/CustomerSidebar";
import ReturnDateNotificationPopup from "../components/Customer/ReturnDateNotificationPopup";
import "../components/Customer/customer-layout.css";

function CustomerLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem("customerSidebarCollapsed") === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("customerSidebarCollapsed", sidebarCollapsed ? "1" : "0");
    } catch {
      // ignore storage failures
    }
  }, [sidebarCollapsed]);

  return (
    <div className={`customer-shell ${sidebarCollapsed ? "is-collapsed" : ""}`}>
      <ReturnDateNotificationPopup />
      <div className="customer-workspace">
        <CustomerSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
        />
        <div className="customer-main-container">
          <CustomerNavbar />
          <main className="customer-main">
            <div className="customer-page-frame">
              <Outlet />
            </div>
          </main>
          <CustomerFooter />
        </div>
      </div>
    </div>
  );
}

export default CustomerLayout;
