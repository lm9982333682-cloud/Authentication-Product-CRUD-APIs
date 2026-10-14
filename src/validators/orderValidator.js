
import { body, validationResult, param } from "express-validator";
import mongoose from "mongoose";

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array().map((error) => ({
                field: error.path,
                message: error.msg,
            })),
        });
    }

    next();
};

export const createOrderValidator = [
    body("items")
        .exists()
        .withMessage("Items are required")
        .bail()
        .isArray({ min: 1 })
        .withMessage("At least one item is required"),

    body("items.*.product")
        .exists()
        .withMessage("Product ID is required")
        .bail()
        .custom((id) => mongoose.isValidObjectId(id))
        .withMessage("Invalid product ID"),

    body("items.*.quantity")
        .exists()
        .withMessage("Quantity is required")
        .bail()
        .isInt({ min: 1 })
        .withMessage("Quantity must be a positive integer")
        .toInt(),

    handleValidation,
];




export const orderIdValidator = [
    param("id")
        .exists()
        .withMessage("Order ID is required")
        .bail()
        .custom((id) => mongoose.isValidObjectId(id))
        .withMessage("Invalid order ID"),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array().map((error) => ({
                    field: error.path,
                    message: error.msg,
                })),
            });
        }

        next();
    },

];

