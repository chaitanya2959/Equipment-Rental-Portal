const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
{
    equipment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Equipment",
        required:true
    },

    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    rating:{
        type:Number,
        required:true,
        min:1,
        max:5
    },

    review:{
        type:String,
        required:true
    },

    ownerReply: {
        type: String,
        default: ""
    },

    ownerRepliedAt: {
        type: Date
    }

},
{
    timestamps:true
});

module.exports = mongoose.model("Review",reviewSchema);
