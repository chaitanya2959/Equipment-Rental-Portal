const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth");
const authorize = require("../middleware/role");

const {
  ownerDashboard,
  customerDashboard,
  adminDashboard,
  ownerRecentBookings,
  ownerNotifications,
} = require("../controllers/dashboard.controller");

const { getAllBookings } = require("../controllers/booking.controller");

// Owner Dashboard
router.get(
  "/owner",
  protect,
  authorize("owner"),
  ownerDashboard
);

// Customer Dashboard
router.get(
  "/customer",
  protect,
  authorize("customer"),
  customerDashboard
);

// Admin Dashboard
router.get(
  "/admin",
  protect,
  authorize("admin"),
  adminDashboard
);

// Owner Recent Bookings
router.get(
  "/owner/recent-bookings",
  protect,
  authorize("owner"),
  ownerRecentBookings
);

// Owner Notifications
router.get(
  "/owner/notifications",
  protect,
  authorize("owner"),
  ownerNotifications
);

// Admin: All Bookings
router.get(
  "/admin/bookings",
  protect,
  authorize("admin"),
  getAllBookings
);

module.exports = router;
