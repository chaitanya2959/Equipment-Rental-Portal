const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
{
    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    equipment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Equipment",
        required:true
    },
    bookingNumber: {
        type: String,
        unique: true
    },
    depositReturned: {
        type: Boolean,
        default: false
    },
    pricePerDay: {
        type: Number,
        required: true
    },
    startDate:{
        type:Date,
        required:true
    },

    endDate:{
        type:Date,
        required:true
    },

    totalDays:{
        type:Number,
        required:true
    },
    returnedAt: {
        type: Date
    },

    totalAmount:{
        type:Number,
        required:true
    },

    status:{
        type:String,
       enum: [
          "Pending",
          "Approved",
          "PickedUp",
          "Completed",
          "Rejected",
          "Cancelled"
        ],
        default:"Pending"
    },
    paymentMethod: {
        type: String,
        enum: ["Cash", "Online"],
        default: "Cash"
    },

    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed", "Refunded"],
        default: "Pending"
    },

    depositAmount: {
        type: Number,
        default: 0
    },
    pickupDate: {
        type: Date
    },  
    returnDate: {
        type: Date
    },  
    remarks: {
        type: String,
        default: ""
    }

},
{
    timestamps:true
});

module.exports=mongoose.model("Booking",bookingSchema);