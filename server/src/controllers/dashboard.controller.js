const Equipment = require("../models/Equipment");
const Booking = require("../models/Booking");
const Wishlist = require("../models/Wishlist");
const Review = require("../models/Review");
const Notification = require("../models/Notification");
const User = require("../models/User");

const ownerDashboard = async (req, res) => {
    try {

        const ownerId = req.user.id;

        // Owner's Equipment
        const equipments = await Equipment.find({
            owner: ownerId
        });

        const equipmentIds = equipments.map(item => item._id);

        const totalEquipments = equipments.length;

        const availableEquipments = await Equipment.countDocuments({
            owner: ownerId,
            available: true
        });

        const activeRentals = await Booking.countDocuments({
            equipment: { $in: equipmentIds },
            status: "PickedUp"
        });

        const pendingBookings = await Booking.countDocuments({
            equipment: { $in: equipmentIds },
            status: "Pending"
        });

        const approvedBookings = await Booking.countDocuments({
            equipment: { $in: equipmentIds },
            status: "Approved"
        });

        const completedBookings = await Booking.countDocuments({
            equipment: { $in: equipmentIds },
            status: "Completed"
        });

        const totalRevenue = await Booking.aggregate([
            {
                $match: {
                    equipment: { $in: equipmentIds },
                    paymentStatus: "Paid"
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: "$totalAmount" }
                }
            }
        ]);

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
                averageRating
            }
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
const ownerRecentBookings = async (req, res) => {
    try {

        const equipments = await Equipment.find({
            owner: req.user.id
        });

        const equipmentIds = equipments.map(item => item._id);

        const bookings = await Booking.find({
            equipment: { $in: equipmentIds }
        })
        .populate("customer", "name email phone")
        .populate("equipment", "name images pricePerDay")
        .sort({ createdAt: -1 })
        .limit(10);

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
const customerDashboard = async (req, res) => {
    try {

        const customerId = req.user.id;

        const totalBookings = await Booking.countDocuments({
            customer: customerId
        });

        const activeBookings = await Booking.countDocuments({
            customer: customerId,
            status: { $in: ["Approved", "PickedUp"] }
        });

        const completedBookings = await Booking.countDocuments({
            customer: customerId,
            status: "Completed"
        });

        const cancelledBookings = await Booking.countDocuments({
            customer: customerId,
            status: "Cancelled"
        });

        const totalSpentResult = await Booking.aggregate([
            {
                $match: {
                    customer: req.user._id,
                    paymentStatus: "Paid"
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalAmount" }
                }
            }
        ]);

        const wishlistCount = await Wishlist.countDocuments({
            customer: customerId
        });

        const reviewCount = await Review.countDocuments({
            customer: customerId
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
                reviewCount
            }
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
const adminDashboard = async (req, res) => {
    try {

        const totalUsers = await User.countDocuments();

        const totalCustomers = await User.countDocuments({
            role: "customer"
        });

        const totalOwners = await User.countDocuments({
            role: "owner"
        });

        const totalAdmins = await User.countDocuments({
            role: "admin"
        });

        const totalEquipments = await Equipment.countDocuments();

        const totalBookings = await Booking.countDocuments();

        const pendingBookings = await Booking.countDocuments({
            status: "Pending"
        });

        const completedBookings = await Booking.countDocuments({
            status: "Completed"
        });

        const totalRevenue = await Booking.aggregate([
            {
                $match: {
                    paymentStatus: "Paid"
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: {
                        $sum: "$totalAmount"
                    }
                }
            }
        ]);

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
                        : 0
            }
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
const ownerNotifications = async (req, res) => {
    try {

        const notifications = await Notification.find({
            user: req.user.id
        })
        .sort({ createdAt: -1 })
        .limit(10);

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
module.exports = {
    ownerDashboard,
    customerDashboard,
    adminDashboard,
    ownerRecentBookings,
    ownerNotifications
};