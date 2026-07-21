const express=require("express");

const router=express.Router();

const protect=require("../middleware/auth");
const authorize=require("../middleware/role");

const {
    getAllUsers,
    toggleUserStatus
} = require("../controllers/admin.controller");

router.get(
    "/users",
    protect,
    authorize("admin"),
    getAllUsers
);
router.put(
    "/users/:id/status",
    protect,
    authorize("admin"),
    toggleUserStatus
);

module.exports=router;