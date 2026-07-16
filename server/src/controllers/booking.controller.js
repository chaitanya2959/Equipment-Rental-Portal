const Booking=require("../models/Booking");
const Equipment=require("../models/Equipment");
const Notification = require("../models/Notification");

const createBooking = async (req, res) => {

    try {

        const equipment = await Equipment.findById(req.body.equipment);

        if (!equipment) {

            return res.status(404).json({
                success:false,
                message:"Equipment Not Found"
            });

        }

        const booking = await Booking.create({

            customer:req.user.id,

            equipment:req.body.equipment,

            startDate:req.body.startDate,

            endDate:req.body.endDate,

            totalDays:req.body.totalDays,

            totalAmount:
                equipment.pricePerDay * req.body.totalDays

        });
        await Notification.create({
            user: req.user.id,
            title: "Booking Created",
            message: "Your booking has been created successfully.",
            type: "booking"
        });

        res.status(201).json({

            success:true,

            message:"Booking Created Successfully",

            data:booking

        });

    }

    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};
const getMyBookings = async (req, res) => {
    try {

        const bookings = await Booking.find({
            customer: req.user.id
        })
        .populate("equipment");

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
const cancelBooking = async (req, res) => {
    try {

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking Not Found"
            });
        }

        // Customer can only cancel their own bookings
        if (booking.customer.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access Denied"
            });
        }

        await Booking.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Booking Cancelled Successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
const updateBookingStatus = async (req, res) => {
    try {

        const { status } = req.body;

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking Not Found"
            });
        }

        booking.status = status;

        await booking.save();

        res.status(200).json({
            success: true,
            message: "Booking Status Updated Successfully",
            data: booking
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
module.exports = {
    createBooking,
    getMyBookings,
    cancelBooking,
    updateBookingStatus
};