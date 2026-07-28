import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Admin/Navbar";
import Sidebar from "../components/Admin/Sidebar";

function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);

      if (mobile) {
        setSidebarCollapsed(true);
        setSidebarOpen(false);
      } else {
        setSidebarOpen(false);
        const stored = localStorage.getItem("renthub_admin_sidebar_collapsed");
        setSidebarCollapsed(stored ? stored === "true" : false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen((prev) => !prev);
      return;
    }

    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("renthub_admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  return (
    <div className={`owner-shell ${sidebarCollapsed ? "is-collapsed" : ""} ${isMobile ? "is-mobile" : ""}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        isOpen={sidebarOpen}
        isMobile={isMobile}
        onToggleCollapse={handleToggleSidebar}
        onCloseMobile={() => setSidebarOpen(false)}
      />
      <div className="owner-main">
        <Navbar onToggleSidebar={handleToggleSidebar} isMobile={isMobile} />
        <main className="owner-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
export default AdminLayout;
