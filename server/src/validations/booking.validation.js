const { body } = require("express-validator");

const bookingValidation = [

    body("equipment")
        .notEmpty()
        .withMessage("Equipment ID is required"),

    body("startDate")
        .isISO8601()
        .withMessage("Invalid Start Date"),

    body("endDate")
        .isISO8601()
        .withMessage("Invalid End Date")

];

module.exports = {
    bookingValidation
};