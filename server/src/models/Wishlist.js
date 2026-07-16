const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
{
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    equipment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Equipment",
        required: true
    }

},
{
    timestamps: true
});

module.exports = mongoose.model("Wishlist", wishlistSchema);