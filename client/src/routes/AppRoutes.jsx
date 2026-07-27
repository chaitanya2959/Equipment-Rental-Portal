import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ROLES } from "../constants/roles";
import AdminLayout from "../layouts/AdminLayout";
import CustomerLayout from "../layouts/CustomerLayout";
import OwnerLayout from "../layouts/OwnerLayout";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import AddEquipment from "../pages/Owner/AddEquipment";
import Dashboard from "../pages/Owner/Dashboard";
import DashboardPlaceholder from "../pages/shared/DashboardPlaceholder";
import Bookings from "../pages/Owner/Bookings";
import CurrentRentals from "../pages/Owner/CurrentRentals";
import Earnings from "../pages/Owner/Earnings";
import EditEquipment from "../pages/Owner/EditEquipment";
import EquipmentDetails from "../pages/Owner/EquipmentDetails";
import MyEquipment from "../pages/Owner/MyEquipment";
import Notifications from "../pages/Owner/Notifications";
import Profile from "../pages/Owner/Profile";
import RentalHistory from "../pages/Owner/RentalHistory";
import Reviews from "../pages/Owner/Reviews";
import Settings from "../pages/Owner/Settings";
import Payments from "../pages/Owner/Payments";
import OwnerPagePlaceholder from "../pages/shared/OwnerPagePlaceholder";
import CustomerHome from "../pages/Customer/Home";
import CustomerEquipment from "../pages/Customer/Equipment";
import CustomerEquipmentDetails from "../pages/Customer/EquipmentDetails";
import CustomerBookings from "../pages/Customer/Bookings";
import CustomerWishlist from "../pages/Customer/Wishlist";
import CustomerProfile from "../pages/Customer/Profile";
import CustomerNotifications from "../pages/Customer/Notifications";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import RoleRedirect from "./RoleRedirect";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>
        <Route path="/" element={<RoleRedirect />} />
        <Route element={<ProtectedRoute allowedRoles={[ROLES.OWNER]} />}>
          <Route element={<OwnerLayout />}>
            <Route path="/owner/dashboard" element={<Dashboard />} />
            <Route path="/owner/equipment" element={<MyEquipment />} />
            <Route path="/owner/equipment/new" element={<AddEquipment />} />
            <Route path="/owner/add-equipment" element={<AddEquipment />} />
            <Route path="/owner/edit-equipment/:id" element={<EditEquipment />} />
            <Route path="/owner/equipment/:id/edit" element={<EditEquipment />} />
            <Route path="/equipment/:id" element={<EquipmentDetails />} />
            <Route path="/owner/booking-requests" element={<Bookings />} />
            <Route path="/owner/current-rentals" element={<CurrentRentals />} />
            <Route path="/owner/rental-history" element={<RentalHistory />} />
            <Route path="/owner/earnings" element={<Earnings />} />
            <Route path="/owner/reviews" element={<Reviews />} />
            <Route path="/owner/notifications" element={<Notifications />} />
            <Route path="/owner/profile" element={<Profile />} />
            <Route path="/owner/payments" element={<Payments />} />
            <Route path="/owner/settings" element={<Settings />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={[ROLES.CUSTOMER]} />}>
          <Route element={<CustomerLayout />}>
            <Route path="/customer/dashboard" element={<CustomerHome />} />
            <Route path="/customer/equipment" element={<CustomerEquipment />} />
            <Route path="/customer/equipment/:id" element={<CustomerEquipmentDetails />} />
            <Route path="/customer/bookings" element={<CustomerBookings />} />
            <Route path="/customer/wishlist" element={<CustomerWishlist />} />
            <Route path="/customer/profile" element={<CustomerProfile />} />
            <Route path="/customer/notifications" element={<CustomerNotifications />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<DashboardPlaceholder role="admin" />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
