const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Equipment = require("../models/Equipment");
const Notification = require("../models/Notification");
const User = require("../models/User");

const generateBookingNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `BK-${timestamp}${random}`;
};

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const createBooking = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.body.equipment);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment Not Found",
      });
    }

    const existingBooking = await Booking.findOne({
      equipment: req.body.equipment,
      status: { $in: ["Pending", "Approved"] },
      startDate: { $lte: req.body.endDate },
      endDate: { $gte: req.body.startDate },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Equipment is already booked for selected dates",
      });
    }

    const start = new Date(req.body.startDate);
    const end = new Date(req.body.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({
        success: false,
        message: "Start Date cannot be in the past",
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "End Date must be after Start Date",
      });
    }

    const totalDays =
      Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (totalDays <= 0) {
      return res.status(400).json({
        success: false,
        message: "End Date must be after Start Date",
      });
    }

    const totalAmount = equipment.pricePerDay * totalDays;

    const bookingNumber = generateBookingNumber();

    const booking = await Booking.create({
      customer: req.user.id,
      owner: equipment.owner,
      equipment: req.body.equipment,
      bookingNumber,
      pricePerDay: equipment.pricePerDay,
      depositAmount: equipment.deposit,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      totalDays,
      totalAmount,
      paymentMethod: req.body.paymentMethod || "Cash",
      paymentStatus: req.body.paymentStatus || "Pending",
    });

    // Create notification for the equipment owner
    const customer = await User.findById(req.user.id).select("name");
    await Notification.create({
      user: equipment.owner,
      title: "New Booking Request",
      message: `${customer?.name || "A customer"} booked ${equipment.name} from ${formatDate(req.body.startDate)} to ${formatDate(req.body.endDate)}.`,
      type: "booking",
      bookingId: booking._id,
      customerId: req.user.id,
      equipmentId: equipment._id,
      ownerId: equipment.owner,
    });

    // Create notification for the customer
    await Notification.create({
      user: req.user.id,
      title: "Booking Created",
      message: `Your booking for ${equipment.name} has been created successfully.`,
      type: "booking",
      bookingId: booking._id,
      customerId: req.user.id,
      equipmentId: equipment._id,
      ownerId: equipment.owner,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("customer", "name email phone")
      .populate("equipment", "name brand category images location modelNumber pricePerDay deposit")
      .populate("owner", "name email phone");

    res.status(201).json({
      success: true,
      message: "Booking Created Successfully",
      data: populatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      customer: req.user.id,
    })
      .populate("equipment", "name brand category images location modelNumber pricePerDay deposit owner")
      .populate("owner", "name email phone");

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

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking Not Found",
      });
    }

    // Customer can only cancel their own bookings
    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    const equipment = await Equipment.findById(booking.equipment);
    const customer = await User.findById(booking.customer).select("name");

    await Booking.findByIdAndDelete(req.params.id);

    // Create notification for the owner about cancellation
    if (equipment) {
      await Notification.create({
        user: booking.owner,
        title: "Booking Cancelled",
        message: `${customer?.name || "A customer"} cancelled their booking for ${equipment.name}.`,
        type: "booking",
        bookingId: booking._id,
        customerId: booking.customer,
        equipmentId: booking.equipment,
        ownerId: booking.owner,
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking Cancelled Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status, paymentMethod, paymentStatus } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking Not Found",
      });
    }

    const previousStatus = booking.status;

    if (status) {
      booking.status = status;
    }

    if (paymentMethod) {
      booking.paymentMethod = paymentMethod;
    }

    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }

    await booking.save();

    const equipment = await Equipment.findById(booking.equipment);
    const customer = await User.findById(booking.customer).select("name");

    // Create notification for the customer when status changes
    let notificationTitle = "";
    let notificationMessage = "";

    if (status && status !== previousStatus) {
      switch (status) {
        case "Approved":
          notificationTitle = "Booking Approved";
          notificationMessage = `Your booking for ${equipment?.name || "equipment"} has been approved.`;
          break;
        case "Rejected":
          notificationTitle = "Booking Rejected";
          notificationMessage = `Your booking for ${equipment?.name || "equipment"} has been rejected.`;
          break;
        case "PickedUp":
          notificationTitle = "Equipment Picked Up";
          notificationMessage = `Your equipment has been marked as picked up.`;
          break;
        case "Completed":
          notificationTitle = "Booking Completed";
          notificationMessage = `Your booking has been completed successfully.`;
          break;
        default:
          notificationTitle = "Booking Status Updated";
          notificationMessage = `Your booking status has been updated to ${status}.`;
      }

      if (notificationTitle) {
        await Notification.create({
          user: booking.customer,
          title: notificationTitle,
          message: notificationMessage,
          type: "booking",
          bookingId: booking._id,
          customerId: booking.customer,
          equipmentId: booking.equipment,
          ownerId: booking.owner,
        });
      }
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate("customer", "name email phone")
      .populate("equipment", "name brand category images location modelNumber pricePerDay deposit")
      .populate("owner", "name email phone");

    res.status(200).json({
      success: true,
      message: "Booking Status Updated Successfully",
      data: populatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getOwnerBookings = async (req, res) => {
  try {
    const equipments = await Equipment.find({
      owner: req.user.id,
    }).select("_id");

    const equipmentIds = equipments.map((item) => item._id);

    const bookings = await Booking.find({
      equipment: { $in: equipmentIds },
    })
      .populate("customer", "name email phone")
      .populate("equipment", "name brand category images location modelNumber pricePerDay deposit")
      .populate("owner", "name email phone");

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

// Admin: Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("customer", "name email phone")
      .populate("equipment", "name brand category images location modelNumber pricePerDay deposit")
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

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

const getCustomerStats = async (req, res) => {
  try {
    const customerId = req.user.id;

    // Total bookings count
    const totalBookings = await Booking.countDocuments({ customer: customerId });

    // Status-based counts
    const activeBookings = await Booking.countDocuments({
      customer: customerId,
      status: { $in: ["Approved", "PickedUp"] },
    });

    const upcomingBookings = await Booking.countDocuments({
      customer: customerId,
      status: "Pending",
      startDate: { $gte: new Date() },
    });

    const completedBookings = await Booking.countDocuments({
      customer: customerId,
      status: "Completed",
    });

    const cancelledBookings = await Booking.countDocuments({
      customer: customerId,
      status: { $in: ["Cancelled", "Rejected"] },
    });

    const customerObjectId = new mongoose.Types.ObjectId(customerId);

    // Total spending on paid bookings
    const totalSpentResult = await Booking.aggregate([
      { $match: { customer: customerObjectId, paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalSpent = totalSpentResult.length > 0 ? totalSpentResult[0].total : 0;

    // Total rental days across all bookings
    const totalDaysResult = await Booking.aggregate([
      { $match: { customer: customerObjectId } },
      { $group: { _id: null, totalDays: { $sum: "$totalDays" } } },
    ]);
    const totalRentalDays = totalDaysResult.length > 0 ? totalDaysResult[0].totalDays : 0;

    // Total reviews given
    const Review = require("../models/Review");
    const totalReviewsGiven = await Review.countDocuments({ customer: customerId });

    // Average rental value
    const avgResult = await Booking.aggregate([
      { $match: { customer: customerObjectId, status: "Completed" } },
      { $group: { _id: null, avg: { $avg: "$totalAmount" } } },
    ]);
    const averageRentalValue = avgResult.length > 0 ? Math.round(avgResult[0].avg) : 0;

    // Highest rental amount
    const highestResult = await Booking.aggregate([
      { $match: { customer: customerObjectId, paymentStatus: "Paid" } },
      { $group: { _id: null, max: { $max: "$totalAmount" } } },
    ]);
    const highestRentalAmount = highestResult.length > 0 ? highestResult[0].max : 0;

    // Total completed rental value
    const completedValueResult = await Booking.aggregate([
      { $match: { customer: customerObjectId, status: "Completed", paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalCompletedRentalValue = completedValueResult.length > 0 ? completedValueResult[0].total : 0;

    // Most rented equipment
    const mostRentedEquipment = await Booking.aggregate([
      { $match: { customer: customerObjectId } },
      { $group: { _id: "$equipment", count: { $sum: 1 }, totalSpent: { $sum: "$totalAmount" } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "equipment",
          localField: "_id",
          foreignField: "_id",
          as: "equipment",
        },
      },
      { $unwind: { path: "$equipment", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          equipmentId: "$_id",
          name: "$equipment.name",
          category: "$equipment.category",
          images: "$equipment.images",
          rentalCount: "$count",
          totalSpent: 1,
          _id: 0,
        },
      },
    ]);

    // Rental activity by month
    const rentalActivity = await Booking.aggregate([
      { $match: { customer: customerObjectId } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          year: "$_id.year",
          month: "$_id.month",
          count: 1,
          totalAmount: 1,
          _id: 0,
        },
      },
    ]);

    // Booking status distribution
    const statusDistribution = await Booking.aggregate([
      { $match: { customer: customerObjectId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } },
    ]);

    // Most rented category
    const mostRentedCategoryResult = await Booking.aggregate([
      { $match: { customer: customerObjectId } },
      {
        $lookup: {
          from: "equipment",
          localField: "equipment",
          foreignField: "_id",
          as: "equipment",
        },
      },
      { $unwind: "$equipment" },
      { $group: { _id: "$equipment.category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    const mostRentedCategory =
      mostRentedCategoryResult.length > 0 ? mostRentedCategoryResult[0]._id : null;

    // Average rental duration
    const avgDurationResult = await Booking.aggregate([
      { $match: { customer: customerObjectId } },
      { $group: { _id: null, avgDays: { $avg: "$totalDays" } } },
    ]);
    const averageRentalDuration = avgDurationResult.length > 0 ? Math.round(avgDurationResult[0].avgDays * 10) / 10 : 0;

    // Highest spending month
    const highestSpendingMonthResult = await Booking.aggregate([
      { $match: { customer: customerObjectId, paymentStatus: "Paid" } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 1 },
      {
        $project: {
          year: "$_id.year",
          month: "$_id.month",
          total: 1,
          _id: 0,
        },
      },
    ]);
    const highestSpendingMonth =
      highestSpendingMonthResult.length > 0 ? highestSpendingMonthResult[0] : null;

    // Recent rentals (last 5)
    const recentRentals = await Booking.find({ customer: customerId })
      .populate("equipment", "name brand category images location")
      .populate("owner", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalBookings,
          activeBookings,
          upcomingBookings,
          completedBookings,
          cancelledBookings,
          totalSpent,
          totalRentalDays,
          totalReviewsGiven,
        },
        spending: {
          totalSpent,
          averageRentalValue,
          highestRentalAmount,
          totalCompletedRentalValue,
        },
        mostRentedEquipment,
        rentalActivity,
        statusDistribution,
        insights: {
          mostRentedCategory,
          totalDays: totalRentalDays,
          totalBookings,
          completedBookings,
          averageRentalDuration,
          highestSpendingMonth,
        },
        recentRentals,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  updateBookingStatus,
  getOwnerBookings,
  getAllBookings,
  getCustomerStats,
};
