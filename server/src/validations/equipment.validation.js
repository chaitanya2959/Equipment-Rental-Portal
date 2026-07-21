const { body } = require("express-validator");

const equipmentValidation = [

    body("name")
        .notEmpty()
        .withMessage("Equipment name is required"),

    body("category")
        .notEmpty()
        .withMessage("Category is required"),

    body("description")
        .notEmpty()
        .withMessage("Description is required"),

    body("brand")
        .notEmpty()
        .withMessage("Brand is required"),

    body("pricePerDay")
        .isFloat({ min: 1 })
        .withMessage("Price per day must be greater than 0"),

    body("deposit")
        .isFloat({ min: 0 })
        .withMessage("Deposit must be 0 or greater"),

    body("quantity")
        .isInt({ min: 1 })
        .withMessage("Quantity must be at least 1"),

    body("location")
        .notEmpty()
        .withMessage("Location is required"),

    body("condition")
        .optional()
        .isIn(["New", "Excellent", "Good", "Fair", "Poor"])
        .withMessage("Invalid condition"),

    body("status")
        .optional()
        .isIn(["Available", "Rented", "Maintenance", "Unavailable"])
        .withMessage("Invalid status")

];

module.exports = {
    equipmentValidation
};