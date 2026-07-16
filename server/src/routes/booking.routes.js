const express=require("express");

const router=express.Router();

const protect=require("../middleware/auth");

const {
    createBooking,
    getMyBookings,
    cancelBooking,
    updateBookingStatus
} = require("../controllers/booking.controller");

router.post("/",protect,createBooking);

router.get("/my-bookings", protect, getMyBookings);

router.delete("/:id", protect, cancelBooking);

router.put("/:id/status", protect, updateBookingStatus);

module.exports=router;