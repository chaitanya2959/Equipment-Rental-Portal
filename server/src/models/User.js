const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        unique:true
    },

    password:{
        type:String,
        required:true
    },

    phone:{
        type:String
    },

    role:{
        type:String,
        enum:["customer","owner","admin"],
        default:"customer"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },

    profileImage: {
        type: String,
        default: ""
    },

    address: {
       type: String,
       default: ""
    },

    city: {
        type: String,
        default: ""
    },

    state: {
        type: String,
        default: ""
    },

    pincode: {
        type: String,
        default: ""
    },
    upiId: {
        type: String,
        default: ""
    },

    bankName: {
        type: String,
        default: ""
    },

    accountNumber: {
        type: String,
        default: ""
    },

    ifscCode: {
        type: String,
        default: ""
    }

},
{
    timestamps:true
});

module.exports = mongoose.model("User",userSchema);