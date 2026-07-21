const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth");
const authorize = require("../middleware/role");

const {
    ownerDashboard,
    customerDashboard,
    adminDashboard,
    ownerRecentBookings,
    ownerNotifications
} = require("../controllers/dashboard.controller");

// Owner Dashboard
router.get(
    "/owner",
    protect,
    authorize("owner"),
    ownerDashboard,
    ownerRecentBookings
);

// Customer Dashboard
router.get(
    "/customer",
    protect,
    authorize("customer"),
    customerDashboard
);
router.get(
    "/owner/notifications",
    protect,
    authorize("owner"),
    ownerNotifications
);
// Admin Dashboard
router.get(
    "/admin",
    protect,
    authorize("admin"),
    adminDashboard
);
router.get(
    "/owner/recent-bookings",
    protect,
    authorize("owner"),
    ownerRecentBookings
);

module.exports = router;