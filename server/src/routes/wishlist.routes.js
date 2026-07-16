const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth");

const {
    addWishlist,
    getWishlist,
    removeWishlist
} = require("../controllers/wishlist.controller");

router.post("/", protect, addWishlist);

router.get("/", protect, getWishlist);

router.delete("/:id", protect, removeWishlist);

module.exports = router;