
const Review = require("../models/Review");
const Equipment = require("../models/Equipment");

const updateEquipmentRating = async (equipmentId) => {

    const reviews = await Review.find({
        equipment: equipmentId
    });

    let average = 0;

    if (reviews.length > 0) {

        const total = reviews.reduce(
            (sum, item) => sum + item.rating,
            0
        );

        average = total / reviews.length;
    }

    await Equipment.findByIdAndUpdate(
        equipmentId,
        {
            averageRating: average,
            totalReviews: reviews.length
        }
    );
};
// Create Review
const createReview = async (req, res) => {
    try {

        const { equipment, rating, review } = req.body;

        const alreadyReviewed = await Review.findOne({
            equipment,
            customer: req.user.id
        });

        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: "You already reviewed this equipment"
            });
        }

        const newReview = await Review.create({
            equipment,
            customer: req.user.id,
            rating,
            review
        });
        await updateEquipmentRating(equipment);

        res.status(201).json({
            success: true,
            message: "Review Added Successfully",
            data: newReview
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get Reviews By Equipment
const getEquipmentReviews = async (req, res) => {
    try {

        const reviews = await Review.find({
            equipment: req.params.equipmentId
        }).populate("customer", "name");

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
const updateReview = async (req, res) => {
    try {

        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review Not Found"
            });
        }

        if (review.customer.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access Denied"
            });
        }

        review.rating = req.body.rating || review.rating;
        review.review = req.body.review || review.review;

        await review.save();

        await updateEquipmentRating(review.equipment);

        res.status(200).json({
            success: true,
            message: "Review Updated Successfully",
            data: review
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
const deleteReview = async (req, res) => {
    try {

        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review Not Found"
            });
        }

        if (review.customer.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access Denied"
            });
        }

        const equipmentId = review.equipment;

        await Review.findByIdAndDelete(req.params.id);

        await updateEquipmentRating(equipmentId);

        res.status(200).json({
            success: true,
            message: "Review Deleted Successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    createReview,
    getEquipmentReviews,
    updateReview,
    deleteReview
};