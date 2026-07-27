const express = require("express");
const validate = require("../middleware/validate");
const protect = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
} = require("../controllers/auth.controller");


const {
    registerValidation,
    loginValidation
} = require("../validations/auth.validation");

const router = express.Router();
router.post(
    "/register",
    registerValidation,
    validate,
    register
);

router.post(
    "/login",
    loginValidation,
    validate,
    login
);
router.get(
    "/profile",
    protect,
    getProfile
);
router.put(
    "/profile",
    protect,
    upload.fields([
        { name: "profileImage", maxCount: 1 },
        { name: "businessLogo", maxCount: 1 },
        { name: "documents", maxCount: 10 },
    ]),
    updateProfile
);
router.put(
    "/change-password",
    protect,
    changePassword
);

module.exports = router;
