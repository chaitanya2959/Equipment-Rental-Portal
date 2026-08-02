const express=require("express");

const router=express.Router();

const protect=require("../middleware/auth");
const validate = require("../middleware/validate");

const {
    createBooking,
    getMyBookings,
    cancelBooking,
    updateBookingStatus,
    getOwnerBookings,
    getCustomerStats
} = require("../controllers/booking.controller");
const {
    bookingValidation
} = require("../validations/booking.validation");

router.post(
    "/",
    protect,
    validate,
    createBooking
);

router.get("/my-bookings", protect, getMyBookings);

router.get(
    "/owner",
    protect,
    getOwnerBookings
);

router.delete("/:id", protect, cancelBooking);

router.put("/:id/status", protect, updateBookingStatus);

router.get("/customer/stats", protect, getCustomerStats);

module.exports=router;
