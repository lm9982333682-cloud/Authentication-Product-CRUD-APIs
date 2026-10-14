
import { body, validationResult } from "express-validator";

export const registerValidator = [
    body("name")
        .exists().withMessage("Name field is required").bail()
        .isString().withMessage("Name must be a string").bail()
        .trim()
        .notEmpty().withMessage("Name cannot be empty").bail()
        .isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),

    body("email")
        .exists().withMessage("Email field is required").bail()
        .isString().withMessage("Email must be a string").bail()
        .trim()
        .notEmpty().withMessage("Email cannot be empty").bail()
        .isEmail().withMessage("Please provide a valid email")
        .normalizeEmail(),

    body("password")
        .exists().withMessage("Password field is required").bail()
        .isString().withMessage("Password must be a string").bail()
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),

    body("confirmPassword")
        .exists().withMessage("Confirm password field is required").bail()
        .isString().withMessage("Confirm password must be a string").bail()
        .notEmpty().withMessage("Confirm password cannot be empty").bail()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match");
            }

            return true;
        }),

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

export const loginValidator = [
    body("email")
        .exists().withMessage("Email field is required").bail()
        .isString().withMessage("Email must be a string").bail()
        .trim()
        .notEmpty().withMessage("Email cannot be empty").bail()
        .isEmail().withMessage("Please provide a valid email")
        .normalizeEmail(),

    body("password")
        .exists().withMessage("Password field is required").bail()
        .isString().withMessage("Password must be a string").bail()
        .notEmpty().withMessage("Password cannot be empty").bail()
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),

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
