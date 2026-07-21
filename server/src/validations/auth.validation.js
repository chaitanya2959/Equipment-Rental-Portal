const { body } = require("express-validator");

const registerValidation = [

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required"),

    body("email")
        .trim()
        .isEmail()
        .withMessage("Invalid email address"),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),

    body("phone")
        .isMobilePhone("en-IN")
        .withMessage("Invalid mobile number"),

    body("role")
        .isIn(["customer", "owner", "admin"])
        .withMessage("Invalid role")

];

const loginValidation = [

    body("email")
        .trim()
        .isEmail()
        .withMessage("Invalid email"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")

];

module.exports = {
    registerValidation,
    loginValidation
};