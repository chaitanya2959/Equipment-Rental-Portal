const Wishlist = require("../models/Wishlist");

// Add Wishlist
const addWishlist = async (req, res) => {
    try {

        const { equipment } = req.body;

        const exists = await Wishlist.findOne({
            customer: req.user.id,
            equipment
        });

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Equipment already in wishlist"
            });
        }

        const wishlist = await Wishlist.create({
            customer: req.user.id,
            equipment
        });

        res.status(201).json({
            success: true,
            message: "Added to Wishlist",
            data: wishlist
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get Wishlist
const getWishlist = async (req, res) => {
    try {

        const wishlist = await Wishlist.find({
            customer: req.user.id
        }).populate("equipment");

        res.status(200).json({
            success: true,
            count: wishlist.length,
            data: wishlist
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Remove Wishlist
const removeWishlist = async (req, res) => {
    try {

        await Wishlist.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Removed From Wishlist"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    addWishlist,
    getWishlist,
    removeWishlist
};