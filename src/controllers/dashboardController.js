import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";

export const getDashboardStats = async (req, res, next) => {
    try {


        const [
            totalUsers,
            totalProducts,
            totalOrders,
            revenueResult,
            recentOrders,
        ] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Order.countDocuments(),

            Order.aggregate([
                {
                    $match: {
                        status: "delivered",
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$totalAmount" },
                    },
                },
            ]),

            Order.find()
                .populate("user", "name email")
                .sort({ createdAt: -1 })
                .limit(5)
                .select("user items totalAmount status createdAt"),
        ]);

        return res.status(200).json({
            success: true,
            message: "Dashboard statistics fetched successfully",
            data: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue: revenueResult[0]?.totalRevenue || 0,
                recentOrders,
            },
        });
    } catch (error) {
        next(error);
    }
};