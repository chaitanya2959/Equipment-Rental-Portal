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
        modelNumber: {
            type: String,
            trim: true,
            default: ""
        },

        condition: {
            type: String,
            enum: ["New", "Excellent", "Good", "Fair", "Poor"],
            default: "Good"
        },

        pricePerDay: {
            type: Number,
            required: true
        },

        deposit: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },

        quantity: {
            type: Number,
            required: true,
            default: 1,
            min: 1
        },

        available: {
            type: Boolean,
            default: true
        },
        status: {
            type: String,
            enum: ["Available", "Rented", "Maintenance", "Unavailable"],
            default: "Available"
        },
        location: {
            type: String,
            required: true
        },

        images:[
        {
            type: String
        }
        ],

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