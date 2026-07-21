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
        const existingBooking = await Booking.findOne({
            equipment: req.body.equipment,
            status: { $in: ["Pending", "Approved"] },
            startDate: { $lte: req.body.endDate },
            endDate: { $gte: req.body.startDate }
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: "Equipment is already booked for selected dates"
            });
        }
        const start = new Date(req.body.startDate);
        const end = new Date(req.body.endDate);
        const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (start < today) {
                return res.status(400).json({
                    success: false,
                    message: "Start Date cannot be in the past"
                });
            }

            if (end < start) {
                return res.status(400).json({
                    success: false,
                    message: "End Date must be after Start Date"
                });
            }

        const totalDays =
            Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        if (totalDays <= 0) {
            return res.status(400).json({
                success: false,
                message: "End Date must be after Start Date"
            });
        }

        const totalAmount = equipment.pricePerDay * totalDays;

        const booking = await Booking.create({

            customer:req.user.id,

            equipment:req.body.equipment,

            startDate:req.body.startDate,

            endDate:req.body.endDate,

            totalDays,

            totalAmount

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
const getOwnerBookings = async (req, res) => {
    try {

        const equipments = await Equipment.find({
            owner: req.user.id
        }).select("_id");

        const equipmentIds = equipments.map(item => item._id);

        const bookings = await Booking.find({
            equipment: { $in: equipmentIds }
        })
        .populate("customer", "name email phone")
        .populate("equipment", "name brand category");

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
module.exports = {
    createBooking,
    getMyBookings,
    cancelBooking,
    updateBookingStatus,
    getOwnerBookings
};