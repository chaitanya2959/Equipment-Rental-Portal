const mongoose = require("mongoose");
const Review = require("../models/Review");
const Equipment = require("../models/Equipment");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const User = require("../models/User");

const toObjectId = (value) => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    return null;
  }

  return new mongoose.Types.ObjectId(value);
};

const recalculateEquipmentRating = async (equipmentId) => {
  const stats = await Review.aggregate([
    {
      $match: {
        equipment: toObjectId(equipmentId),
      },
    },
    {
      $group: {
        _id: "$equipment",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const ratingData = stats[0] || {
    averageRating: 0,
    totalReviews: 0,
  };

  await Equipment.findByIdAndUpdate(equipmentId, {
    averageRating: Number(Number(ratingData.averageRating || 0).toFixed(1)),
    totalReviews: ratingData.totalReviews || 0,
  });
};

const createReview = async (req, res) => {
  try {
    const { equipment, rating, review } = req.body;
    const numericRating = Number(rating);

    if (!equipment || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: "Equipment, rating, and review are required",
      });
    }

    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const equipmentDoc = await Equipment.findById(equipment);
    if (!equipmentDoc) {
      return res.status(404).json({
        success: false,
        message: "Equipment Not Found",
      });
    }

    const customerId = req.user.id;
    const completedBooking = await Booking.findOne({
      equipment,
      customer: customerId,
      status: "Completed",
    });

    if (!completedBooking) {
      return res.status(403).json({
        success: false,
        message: "Only customers with a completed booking can review this equipment",
      });
    }

    const existingReview = await Review.findOne({
      equipment,
      customer: customerId,
    });

    let savedReview;
    if (existingReview) {
      existingReview.rating = rating;
      existingReview.review = review;
      savedReview = await existingReview.save();
    } else {
      savedReview = await Review.create({
        equipment,
        customer: customerId,
        rating: numericRating,
        review,
      });
    }

    await recalculateEquipmentRating(equipment);

    const populatedReview = await Review.findById(savedReview._id)
      .populate("customer", "name email phone profileImage")
      .populate("equipment", "name category images owner");

    // Create notification for the equipment owner
    const customer = await User.findById(customerId).select("name");
    const ownerId = equipmentDoc.owner;

    await Notification.create({
      user: ownerId,
      title: "New Review Received",
      message: `${customer?.name || "A customer"} rated your ${equipmentDoc.name} ${numericRating} stars.`,
      type: "review",
      equipmentId: equipment,
      customerId: customerId,
      ownerId: ownerId,
    });

    return res.status(201).json({
      success: true,
      message: "Review saved successfully",
      data: populatedReview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getEquipmentReviews = async (req, res) => {
  try {
    const { equipmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid equipment id",
      });
    }

    const reviews = await Review.find({ equipment: equipmentId })
      .populate("customer", "name email phone profileImage")
      .populate("equipment", "name category images owner")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review Not Found",
      });
    }

    const equipment = await Equipment.findById(review.equipment);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment Not Found",
      });
    }

    const isOwner = equipment.owner.toString() === req.user.id;
    const isCustomer = review.customer.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    const { rating, review: reviewText, ownerReply } = req.body;

    if (ownerReply !== undefined) {
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Access Denied",
        });
      }

      review.ownerReply = ownerReply;
      review.ownerRepliedAt = ownerReply.trim() ? new Date() : undefined;
    }

    if (rating !== undefined || reviewText !== undefined) {
      if (!isCustomer && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Access Denied",
        });
      }

      if (rating !== undefined) {
        const numericUpdateRating = Number(rating);
        if (!Number.isFinite(numericUpdateRating) || numericUpdateRating < 1 || numericUpdateRating > 5) {
          return res.status(400).json({
            success: false,
            message: "Rating must be between 1 and 5",
          });
        }
        review.rating = numericUpdateRating;
      }
      if (reviewText !== undefined) review.review = reviewText;
    }

    const updatedReview = await review.save();
    await recalculateEquipmentRating(review.equipment);

    const populatedReview = await Review.findById(updatedReview._id)
      .populate("customer", "name email phone profileImage")
      .populate("equipment", "name category images owner");

    return res.status(200).json({
      success: true,
      message: "Review Updated Successfully",
      data: populatedReview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review Not Found",
      });
    }

    const equipment = await Equipment.findById(review.equipment);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment Not Found",
      });
    }

    const isOwner = equipment.owner.toString() === req.user.id;
    const isCustomer = review.customer.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isCustomer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    await Review.findByIdAndDelete(req.params.id);
    await recalculateEquipmentRating(review.equipment);

    return res.status(200).json({
      success: true,
      message: "Review Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createReview,
  getEquipmentReviews,
  updateReview,
  deleteReview,
};
