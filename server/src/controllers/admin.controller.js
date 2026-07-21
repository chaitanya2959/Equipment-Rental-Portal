const User = require("../models/User");

const getAllUsers = async (req, res) => {
    try {

        const users = await User.find().select("-password");

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {

        res.status(500).json({
            success:false,
            message:error.message
        });

    }
};
const toggleUserStatus = async (req,res)=>{

    try{

        const user=await User.findById(req.params.id);

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User Not Found"
            });
        }

        user.isActive=!user.isActive;

        await user.save();

        res.status(200).json({
            success:true,
            message:user.isActive
                ?"User Activated"
                :"User Blocked",
            data:user
        });

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};
module.exports={
    getAllUsers,
    toggleUserStatus
};