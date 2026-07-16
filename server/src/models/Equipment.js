const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true
        },

        description: {
            type: String,
            required: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        brand: {
            type: String,
            required: true
        },

        pricePerDay: {
            type: Number,
            required: true
        },

        deposit: {
            type: Number,
            required: true
        },

        quantity: {
            type: Number,
            default: 1
        },

        available: {
            type: Boolean,
            default: true
        },

        location: {
            type: String,
            required: true
        },

        image: {
            type: String,
            default: ""
        },
        averageRating: {
            type: Number,
            default: 0
        },

        totalReviews: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Equipment", equipmentSchema);