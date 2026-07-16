
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

module.exports = {
    createReview,
    getEquipmentReviews
};