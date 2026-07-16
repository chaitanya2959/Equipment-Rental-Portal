const { body } = require("express-validator");

const registerValidation = [

    body("name")
        .notEmpty()
        .withMessage("Name is required"),

    body("email")
        .isEmail()
        .withMessage("Invalid Email"),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),

    body("phone")
        .isLength({ min: 10, max: 10 })
        .withMessage("Phone must be 10 digits"),

    body("role")
        .isIn(["customer", "owner", "admin"])
        .withMessage("Invalid Role")

];

const loginValidation = [

    body("email")
        .isEmail()
        .withMessage("Invalid Email"),

    body("password")
        .notEmpty()
        .withMessage("Password Required")

];

module.exports = {
    registerValidation,
    loginValidation
};