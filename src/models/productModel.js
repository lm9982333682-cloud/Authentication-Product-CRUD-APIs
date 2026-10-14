
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Product title is required"],
        trim: true,
        minlength: 2,
        maxlength: 100,
    },

    description: {
        type: String,
        required: [true, "Product description is required"],
        trim: true,
        maxlength: 2000,
    },

    price: {
        type: Number,
        required: [true, "Product price is required"],
        min: 0,
    },

    images: {
        type: [String],
        default: [],
    },

    sizes: {
        type: [String],
        default: [],
    },

    category: {
        type: String,
        required: [true, "Category is required"],
        trim: true,
    },


    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },

    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active",
    },

    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

}, { timestamps: true, });

const Product = mongoose.model("Product", productSchema);

export default Product;
