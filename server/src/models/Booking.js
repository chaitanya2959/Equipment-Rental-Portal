const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
{
    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    equipment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Equipment",
        required:true
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

    totalAmount:{
        type:Number,
        required:true
    },

    status:{
        type:String,
        enum:[
            "Pending",
            "Approved",
            "Rejected",
            "Completed"
        ],
        default:"Pending"
    }

},
{
    timestamps:true
});

module.exports=mongoose.model("Booking",bookingSchema);