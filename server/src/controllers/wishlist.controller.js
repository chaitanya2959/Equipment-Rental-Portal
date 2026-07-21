const Wishlist = require("../models/Wishlist");

// Add to Wishlist
const addToWishlist = async (req, res) => {
    try {

        const { equipment } = req.body;

        const existingWishlist = await Wishlist.findOne({
            customer: req.user.id,
            equipment
        });

        if (existingWishlist) {
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
            message: "Added to Wishlist Successfully",
            data: wishlist
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get My Wishlist
const getMyWishlist = async (req, res) => {
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

// Remove from Wishlist
const removeWishlist = async (req, res) => {
    try {

        const wishlist = await Wishlist.findById(req.params.id);

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist Item Not Found"
            });
        }

        if (wishlist.customer.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access Denied"
            });
        }

        await Wishlist.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Removed from Wishlist Successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    addToWishlist,
    getMyWishlist,
    removeWishlist
};