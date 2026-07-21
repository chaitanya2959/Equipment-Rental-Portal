const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth");

const {
    addToWishlist,
    getMyWishlist,
    removeWishlist
} = require("../controllers/wishlist.controller");

router.post("/", protect, addToWishlist);

router.get("/", protect, getMyWishlist);

router.delete("/:id", protect, removeWishlist);

module.exports = router;