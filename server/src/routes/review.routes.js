const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth");
const {
    createReview,
    getEquipmentReviews,
    updateReview,
    deleteReview,
    getMyReviews
} = require("../controllers/review.controller");

router.post("/", protect, createReview);

router.get("/my-reviews", protect, getMyReviews);

router.get("/:equipmentId", getEquipmentReviews);

// Update Review
router.put("/:id", protect, updateReview);

// Delete Review
router.delete("/:id", protect, deleteReview);

module.exports = router;