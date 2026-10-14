
import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import ApiError from "../utils/ApiError.js";


// Escape user input before using it in a regular expression.
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}





export const createOrder = async (req, res, next) => {
    try {
        const { items } = req.body;

        // Check duplicate products and validate quantities
        const productIds = items.map((item) => item.product);

        if (
            productIds.some((id) => !mongoose.isValidObjectId(id)) ||
            new Set(productIds.map(String)).size !== productIds.length
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid or duplicate product IDs",
            });
        }


        // Fetch actual products from database
        const products = await Product.find({
            _id: { $in: productIds },
        });

        if (products.length !== productIds.length) {
            return res.status(404).json({
                success: false,
                message: "One or more products were not found",
            });
        }

        const productMap = new Map(
            products.map((product) => [
                product._id.toString(),
                product,
            ])
        );

        // Calculate prices on the server
        const orderItems = items.map((item) => {
            const product = productMap.get(String(item.product));

            return {
                product: product._id,
                quantity: item.quantity,
                price: product.price,
            };
        });

        const totalAmount = orderItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );

        // Create order for the logged-in user
        const order = await Order.create({
            user: req.user.userId,
            items: orderItems,
            totalAmount,
        });

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: order,
        });
    } catch (error) {
        next(error);
    }
};


export const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({
            user: req.user.userId,
        }).populate("items.product", "title images price").sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        next(error);
    }
};


export const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            throw new ApiError(400, "Invalid order ID");
        }

        const isAdmin = req.user.role === "admin";

        const filter = isAdmin
            ? { _id: id }
            : { _id: id, user: req.user.userId };

        const order = await Order.findOne(filter)
            .populate("user", "name email phone")
            .populate("items.product", "title images price");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        next(error);
    }
};


export const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "pending",
            "confirmed",
            "shipped",
            "delivered",
            "cancelled",
        ];

        if (!mongoose.isValidObjectId(id)) {
            throw new ApiError(400, "Invalid order ID");
        }

        if (!allowedStatuses.includes(status)) {
            throw new ApiError(400, "Invalid order status");
        }

        const order = await Order.findById(id);

        if (!order) {
            throw new ApiError(404, "Order not found");
        }

        order.status = status;
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: {
                _id: order._id,
                status: order.status,
            },
        });
    } catch (error) {
        next(error);
    }
};



export const updateOrderNotes = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            throw new ApiError(400, "Invalid order ID");
        }

        if (typeof notes !== "string") {
            throw new ApiError(400, "Notes must be a string");
        }

        if (notes.length > 1000) {
            throw new ApiError(400, "Notes cannot exceed 1000 characters");
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { $set: { notes: notes.trim() } },
            { new: true, runValidators: true }
        );

        if (!order) {
            throw new ApiError(404, "Order not found");
        }

        return res.status(200).json({
            success: true,
            message: "Order notes updated successfully",
            data: {
                _id: order._id,
                notes: order.notes,
            },
        });
    } catch (error) {
        next(error);
    }
};




export const getAllOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 8, search = "", status = "", paymentStatus = "", } = req.query;

        const pageNumber = Math.max(1, parseInt(page, 10) || 1);
        const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 8));

        const filter = {};

        const allowedStatuses = [
            "pending",
            "confirmed",
            "shipped",
            "delivered",
            "cancelled",
        ];

        const allowedPaymentStatuses = ["paid", "pending", "failed",];

        if (status) {
            if (!allowedStatuses.includes(status)) {
                throw new ApiError(400, "Invalid order status");
            }

            filter.status = status;
        }

        if (paymentStatus) {
            const normalizedPaymentStatus = paymentStatus.toLowerCase();

            if (!allowedPaymentStatuses.includes(normalizedPaymentStatus)) {
                throw new ApiError(400, "Invalid payment status");
            }

            filter.paymentStatus = normalizedPaymentStatus;
        }

        const searchTerm = search.trim();

        if (searchTerm) {
            const searchConditions = [];

            // Search by order ID
            if (mongoose.isValidObjectId(searchTerm)) {
                searchConditions.push({
                    _id: searchTerm,
                });
            }

            // Search by customer name or email
            const matchingUsers = await mongoose
                .model("User")
                .find({
                    $or: [
                        {
                            name: {
                                $regex: escapeRegex(searchTerm),
                                $options: "i",
                            },
                        },
                        {
                            email: {
                                $regex: escapeRegex(searchTerm),
                                $options: "i",
                            },
                        },
                    ],
                }).select("_id").lean();

            const userIds = matchingUsers.map((user) => user._id);

            if (userIds.length > 0) {
                searchConditions.push({
                    user: { $in: userIds },
                });
            }

            if (searchConditions.length === 0) {
                return res.status(200).json({
                    success: true,
                    data: [],
                    pagination: {
                        total: 0,
                        page: pageNumber,
                        limit: limitNumber,
                        totalPages: 0,
                    },
                });
            }

            filter.$or = searchConditions;
        }

        const [orders, total] = await Promise.all([
            Order.find(filter).populate("user", "name email").populate("items.product", "title images price").sort({ createdAt: -1 }).skip((pageNumber - 1) * limitNumber).limit(limitNumber),

            Order.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber),
            },
        });
    } catch (error) {
        next(error);
    }
};



export const getOrderStats = async (req, res, next) => {
    try {
        const [
            totalOrders,
            pendingOrders,
            deliveredOrders,
            paidOrders,
        ] = await Promise.all([
            Order.countDocuments(),
            Order.countDocuments({ status: "pending" }),
            Order.countDocuments({ status: "delivered" }),
            Order.find({ paymentStatus: "paid" })
                .select("totalAmount")
                .lean(),
        ]);

        const paidRevenue = paidOrders.reduce((total, order) => total + (Number(order.totalAmount) || 0), 0);

        return res.status(200).json({
            success: true,
            data: {
                totalOrders,
                pendingOrders,
                deliveredOrders,
                paidRevenue,
            },
        });
    } catch (error) {
        next(error);
    }
};




