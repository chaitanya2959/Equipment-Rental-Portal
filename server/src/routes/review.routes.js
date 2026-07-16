const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth");

const {
    createReview,
    getEquipmentReviews
} = require("../controllers/review.controller");

router.post("/", protect, createReview);

router.get("/:equipmentId", getEquipmentReviews);

module.exports = router;