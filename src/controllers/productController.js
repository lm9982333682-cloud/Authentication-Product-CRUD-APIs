
import mongoose from "mongoose";
import Product from "../models/productModel.js";
import ApiError from "../utils/ApiError.js";
import uploadFile from "../services/storageServices.js";

const isAdmin = (req) => req.user?.role === "admin";

const canManageProduct = (req, product) => {
    return (
        isAdmin(req) ||
        product.seller?.toString() === req.user?.userId
    );
};



export const createProduct = async (req, res, next) => {
    try {
        const { title, description, stock, price, sizes, category } = req.body;

        const images = [];

        console.log(req.files);



        for (const file of req.files || []) {
            const result = await uploadFile({
                buffer: file.buffer,
                fileName: file.originalname,
            });

            images.push(result.url);
        }

        const product = await Product.create({
            title,
            description,
            price,
            sizes,
            category,
            images,
            stock,
            seller: req.user.userId,
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllProducts = async (req, res, next) => {
    try {
        const products = await Product.find()
            .populate("seller", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: products.length,
            products,
        });
    } catch (error) {
        next(error);
    }
};

export const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            throw new ApiError(400, "Invalid product ID");
        }

        const product = await Product.findById(id)
            .populate("seller", "name email");

        if (!product) {
            throw new ApiError(404, "Product not found");
        }

        return res.status(200).json({
            success: true,
            product,
        });
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            throw new ApiError(400, "Invalid product ID");
        }

        const product = await Product.findById(id);

        if (!product) {
            throw new ApiError(404, "Product not found");
        }

        if (!canManageProduct(req, product)) {
            throw new ApiError(403, "You are not allowed to update this product");
        }

        const allowedFields = [
            "title",
            "description",
            "price",
            "sizes",
            "category",
            "status",
            "stock"
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                product.set(field, req.body[field]);
            }
        }

        // Upload new images when files are provided.
        const files = req.files || [];

        if (files.length > 0) {
            const uploadedImages = [];

            for (const file of files) {
                const result = await uploadFile({
                    buffer: file.buffer,
                    fileName: file.originalname,
                });

                uploadedImages.push(result.url);
            }

            // Replace existing images only after the new uploads succeed.
            product.images = uploadedImages;
        }

        await product.save();

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product,
        });

    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            throw new ApiError(400, "Invalid product ID");
        }

        const product = await Product.findById(id);

        if (!product) {
            throw new ApiError(404, "Product not found");
        }

        if (!canManageProduct(req, product)) {
            throw new ApiError(403, "You are not allowed to delete this product");
        }

        await product.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};