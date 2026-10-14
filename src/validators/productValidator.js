
import { body, param, validationResult } from "express-validator";
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
}



const productFields = [
    body("title")
        .exists().withMessage("Title is required").bail()
        .isString().withMessage("Title must be a string").bail()
        .trim()
        .notEmpty().withMessage("Title cannot be empty").bail()
        .isLength({ min: 2, max: 100 }).withMessage("Title must be 2 to 100 characters"),

    body("description")
        .exists().withMessage("Description is required").bail()
        .isString().withMessage("Description must be a string").bail()
        .trim()
        .notEmpty().withMessage("Description cannot be empty").bail()
        .isLength({ max: 2000 }).withMessage("Description cannot exceed 2000 characters"),

    body("price")
        .exists().withMessage("Price is required").bail()
        .isFloat({ min: 0 }).withMessage("Price must be a non-negative number")
        .toFloat(),

    body("category")
        .exists().withMessage("Category is required").bail()
        .isString().withMessage("Category must be a string").bail()
        .trim()
        .notEmpty().withMessage("Category cannot be empty"),


    body("images")
        .exists().withMessage("Images field is required").bail()
        .isArray({ min: 1, max: 5 }).withMessage("Images must contain between 1 and 5 items"),

    body("images.*")
        .isString().withMessage("Each image must be a string").bail()
        .trim()
        .notEmpty().withMessage("Image URL cannot be empty"),

    body("sizes")
        .exists().withMessage("Sizes field is required").bail()
        .isArray({ min: 1 }).withMessage("At least one size is required"),

    body("sizes.*")
        .isString().withMessage("Each size must be a string").bail()
        .trim()
        .notEmpty().withMessage("Size cannot be empty"),

];


export const createProductValidator = [
    body("title")
        .exists().withMessage("Title is required").bail()
        .isString().withMessage("Title must be a string").bail()
        .trim()
        .notEmpty().withMessage("Title cannot be empty").bail()
        .isLength({ min: 2, max: 100 }).withMessage("Title must be 2 to 100 characters"),

    body("description")
        .exists().withMessage("Description is required").bail()
        .isString().withMessage("Description must be a string").bail()
        .trim()
        .notEmpty().withMessage("Description cannot be empty").bail()
        .isLength({ max: 2000 }).withMessage("Description cannot exceed 2000 characters"),

    body("price")
        .exists().withMessage("Price is required").bail()
        .isFloat({ min: 0 }).withMessage("Price must be a non-negative number")
        .toFloat(),

    body("category")
        .exists().withMessage("Category is required").bail()
        .isString().withMessage("Category must be a string").bail()
        .trim()
        .notEmpty().withMessage("Category cannot be empty"),

    body("stock")
        .exists().withMessage("Stock is required").bail()
        .trim()
        .notEmpty().withMessage("Stock  cannot be empty"),



    body("sizes")
        .exists().withMessage("Sizes field is required").bail()
        .isArray({ min: 1 }).withMessage("At least one size is required"),

    body("sizes.*")
        .isString().withMessage("Each size must be a string").bail()
        .trim()
        .notEmpty().withMessage("Size cannot be empty"),
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
    }
];






export const updateProductValidator = [
    ...productFields.map((validator) =>
        validator.optional({ values: "undefined" })
    ),
    handleValidation,
];

export const productIdValidator = [
    param("id")
        .exists().withMessage("Product ID is required").bail()
        .custom((id) => mongoose.isValidObjectId(id)).withMessage("Invalid product ID"),
    handleValidation,
];


export const parseProductData = (req, res, next) => {
    try {


        if (req.body.sizes) {
            req.body.sizes = JSON.parse(req.body.sizes);
        }



        next();
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: "Invalid JSON format"
        });
    }
};




export const validateImages = (req, res, next) => {

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Images are Required"
        });
    }

    if (req.files.length > 5) {
        return res.status(400).json({
            success: false,
            message: "Product must have between 1 to 5 images"
        });
    }

    next();
};