import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ROLES } from "../constants/roles";
import AdminLayout from "../layouts/AdminLayout";
import CustomerLayout from "../layouts/CustomerLayout";
import OwnerLayout from "../layouts/OwnerLayout";
import PublicLayout from "../layouts/PublicLayout";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import AddEquipment from "../pages/Owner/AddEquipment";
import Dashboard from "../pages/Owner/Dashboard";
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
import Chat from "../pages/Owner/Chat";
import CustomerHome from "../pages/Customer/Home";
import CustomerEquipment from "../pages/Customer/Equipment";
import CustomerEquipmentDetails from "../pages/Customer/EquipmentDetails";
import CustomerBookings from "../pages/Customer/Bookings";
import BookingSuccess from "../pages/Customer/BookingSuccess";
import CustomerWishlist from "../pages/Customer/Wishlist";
import CustomerProfile from "../pages/Customer/Profile";
import CustomerNotifications from "../pages/Customer/Notifications";
import NotificationDetails from "../pages/shared/NotificationDetails";
import ReviewDetails from "../pages/shared/ReviewDetails";
import AdminDashboard from "../pages/Admin/Dashboard";
import AdminUsers from "../pages/Admin/Users";
import AdminEquipments from "../pages/Admin/Equipments";
import AdminBookings from "../pages/Admin/Bookings";
import AdminCategories from "../pages/Admin/Categories";
import AdminPayments from "../pages/Admin/Payments";
import AdminReviews from "../pages/Admin/Reviews";
import AdminNotifications from "../pages/Admin/Notifications";
import AdminReports from "../pages/Admin/Reports";
import AdminSettings from "../pages/Admin/Settings";
import Owners from "../pages/Admin/Owners";
import Customers from "../pages/Admin/Customers";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import PublicHome from "../pages/Public/Home";
import PublicAbout from "../pages/Public/About";
import PublicCategories from "../pages/Public/Categories";
import PublicHowItWorks from "../pages/Public/HowItWorks";
import PublicContact from "../pages/Public/Contact";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PublicHome />} />
          <Route path="/about" element={<PublicAbout />} />
          <Route path="/categories" element={<PublicCategories />} />
          <Route path="/how-it-works" element={<PublicHowItWorks />} />
          <Route path="/contact" element={<PublicContact />} />
          <Route path="/equipment" element={<CustomerEquipment />} />
          <Route path="/equipment/:id" element={<CustomerEquipmentDetails />} />
        </Route>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={[ROLES.OWNER]} />}>
          <Route element={<OwnerLayout />}>
            <Route path="/owner/dashboard" element={<Dashboard />} />
            <Route path="/owner/equipment" element={<MyEquipment />} />
            <Route path="/owner/equipment/new" element={<AddEquipment />} />
            <Route path="/owner/add-equipment" element={<AddEquipment />} />
            <Route path="/owner/edit-equipment/:id" element={<EditEquipment />} />
            <Route path="/owner/equipment/edit/:id" element={<EditEquipment />} />
            <Route path="/owner/equipment/:id/edit" element={<EditEquipment />} />
            <Route path="/owner/equipment/:id" element={<EquipmentDetails />} />
            <Route path="/equipment/:id" element={<EquipmentDetails />} />
            <Route path="/owner/booking-requests" element={<Bookings />} />
            <Route path="/owner/current-rentals" element={<CurrentRentals />} />
            <Route path="/owner/rental-history" element={<RentalHistory />} />
            <Route path="/owner/earnings" element={<Earnings />} />
            <Route path="/owner/reviews" element={<Reviews />} />
            <Route path="/owner/reviews/:reviewId" element={<ReviewDetails />} />
            <Route path="/owner/notifications" element={<Notifications />} />
            <Route path="/owner/notifications/:id" element={<NotificationDetails />} />
            <Route path="/owner/chat" element={<Chat />} />
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
            <Route path="/customer/bookings/success" element={<BookingSuccess />} />
            <Route path="/customer/wishlist" element={<CustomerWishlist />} />
            <Route path="/customer/profile" element={<CustomerProfile />} />
            <Route path="/customer/notifications" element={<CustomerNotifications />} />
            <Route path="/customer/notifications/:id" element={<NotificationDetails />} />
            <Route path="/customer/reviews/:reviewId" element={<ReviewDetails />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/owners" element={<Owners />} />
            <Route path="/admin/customers" element={<Customers />} />
            <Route path="/admin/equipments" element={<AdminEquipments />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
