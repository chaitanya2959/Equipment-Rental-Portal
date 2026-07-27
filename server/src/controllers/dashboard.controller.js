const Equipment = require("../models/Equipment");
const Booking = require("../models/Booking");
const Wishlist = require("../models/Wishlist");
const Review = require("../models/Review");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Category = require("../models/Category");

const ownerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Owner's Equipment
    const equipments = await Equipment.find({
      owner: ownerId,
    });

    const equipmentIds = equipments.map((item) => item._id);

    const totalEquipments = equipments.length;

    const availableEquipments = await Equipment.countDocuments({
      owner: ownerId,
      available: true,
    });

    const activeRentals = await Booking.countDocuments({
      equipment: { $in: equipmentIds },
      status: "PickedUp",
    });

    const pendingBookings = await Booking.countDocuments({
      equipment: { $in: equipmentIds },
      status: "Pending",
    });

    const approvedBookings = await Booking.countDocuments({
      equipment: { $in: equipmentIds },
      status: "Approved",
    });

    const completedBookings = await Booking.countDocuments({
      equipment: { $in: equipmentIds },
      status: "Completed",
    });

    const totalRevenue = await Booking.aggregate([
      {
        $match: {
          equipment: { $in: equipmentIds },
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    // New: Pending Payments count
    const pendingPayments = await Booking.countDocuments({
      equipment: { $in: equipmentIds },
      paymentStatus: "Pending",
    });

    // New: Paid Payments count
    const paidPayments = await Booking.countDocuments({
      equipment: { $in: equipmentIds },
      paymentStatus: "Paid",
    });

    // New: Today's Bookings count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await Booking.countDocuments({
      equipment: { $in: equipmentIds },
      createdAt: { $gte: today, $lt: tomorrow },
    });

    // New: Unread Notifications count
    const unreadNotifications = await Notification.countDocuments({
      user: ownerId,
      isRead: false,
    });

    // New: Pending Booking Requests count
    const pendingBookingRequests = await Booking.countDocuments({
      equipment: { $in: equipmentIds },
      status: "Pending",
    });

    const averageRating =
      equipments.length > 0
        ? (
            equipments.reduce(
              (sum, item) => sum + item.averageRating,
              0
            ) / equipments.length
          ).toFixed(1)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        totalEquipments,
        availableEquipments,
        activeRentals,
        pendingBookings,
        approvedBookings,
        completedBookings,
        totalRevenue:
          totalRevenue.length > 0
            ? totalRevenue[0].revenue
            : 0,
        averageRating,
        pendingPayments,
        paidPayments,
        todayBookings,
        unreadNotifications,
        pendingBookingRequests,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const ownerRecentBookings = async (req, res) => {
  try {
    const equipments = await Equipment.find({
      owner: req.user.id,
    });

    const equipmentIds = equipments.map((item) => item._id);

    const bookings = await Booking.find({
      equipment: { $in: equipmentIds },
    })
      .populate("customer", "name email phone")
      .populate("equipment", "name images pricePerDay")
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const customerDashboard = async (req, res) => {
  try {
    const customerId = req.user.id;

    const totalBookings = await Booking.countDocuments({
      customer: customerId,
    });

    const activeBookings = await Booking.countDocuments({
      customer: customerId,
      status: { $in: ["Approved", "PickedUp"] },
    });

    const completedBookings = await Booking.countDocuments({
      customer: customerId,
      status: "Completed",
    });

    const cancelledBookings = await Booking.countDocuments({
      customer: customerId,
      status: "Cancelled",
    });

    const totalSpentResult = await Booking.aggregate([
      {
        $match: {
          customer: req.user._id,
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    const wishlistCount = await Wishlist.countDocuments({
      customer: customerId,
    });

    const reviewCount = await Review.countDocuments({
      customer: customerId,
    });

    // New: Unread notifications count for customer
    const unreadNotifications = await Notification.countDocuments({
      user: customerId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        activeBookings,
        completedBookings,
        cancelledBookings,
        totalSpent:
          totalSpentResult.length > 0
            ? totalSpentResult[0].total
            : 0,
        wishlistCount,
        reviewCount,
        unreadNotifications,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const adminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalCustomers = await User.countDocuments({
      role: "customer",
    });

    const totalOwners = await User.countDocuments({
      role: "owner",
    });

    const totalAdmins = await User.countDocuments({
      role: "admin",
    });

    const totalEquipments = await Equipment.countDocuments();

    const totalBookings = await Booking.countDocuments();

    const pendingBookings = await Booking.countDocuments({
      status: "Pending",
    });

    const completedBookings = await Booking.countDocuments({
      status: "Completed",
    });

    const totalRevenue = await Booking.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          revenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    // New: Category count
    const totalCategories = await Category.countDocuments();

    // New: Pending payments count
    const pendingPayments = await Booking.countDocuments({
      paymentStatus: "Pending",
    });

    // New: Paid payments count
    const paidPayments = await Booking.countDocuments({
      paymentStatus: "Paid",
    });

    // New: Failed payments count
    const failedPayments = await Booking.countDocuments({
      paymentStatus: "Failed",
    });

    // New: Refunded payments count
    const refundedPayments = await Booking.countDocuments({
      paymentStatus: "Refunded",
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCustomers,
        totalOwners,
        totalAdmins,
        totalEquipments,
        totalBookings,
        pendingBookings,
        completedBookings,
        totalRevenue:
          totalRevenue.length > 0
            ? totalRevenue[0].revenue
            : 0,
        totalCategories,
        pendingPayments,
        paidPayments,
        failedPayments,
        refundedPayments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const ownerNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id,
    })
      .populate("bookingId", "bookingNumber status totalAmount")
      .populate("equipmentId", "name category images")
      .populate("customerId", "name email phone")
      .populate("ownerId", "name email phone")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  ownerDashboard,
  customerDashboard,
  adminDashboard,
  ownerRecentBookings,
  ownerNotifications,
};
