
import User from "../models/userModel.js";
import ApiError from "../utils/ApiError.js";

// GET /api/users
export const getAllUsers = async (req, res, next) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(
            100,
            Math.max(1, Number(req.query.limit) || 10)
        );

        const search = req.query.search?.trim() || "";

        // Escape special regex characters entered by the user
        const escapedSearch = search.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        const filter = search
            ? {
                $or: [
                    {
                        name: {
                            $regex: escapedSearch,
                            $options: "i",
                        },
                    },
                    {
                        email: {
                            $regex: escapedSearch,
                            $options: "i",
                        },
                    },
                ],
            }
            : {};

        const [users, totalUsers] = await Promise.all([
            User.find(filter)
                .select("-password -refreshToken")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),

            User.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: {
                users,
                pagination: {
                    totalUsers,
                    currentPage: page,
                    totalPages: Math.ceil(totalUsers / limit),
                    limit,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/users/stats
export const getUserStats = async (req, res, next) => {
    try {
        const [totalUsers, customerUsers, sellerUsers, adminUsers] =
            await Promise.all([
                User.countDocuments(),
                User.countDocuments({ role: "user" }),
                User.countDocuments({ role: "seller" }),
                User.countDocuments({ role: "admin" }),
            ]);

        return res.status(200).json({
            success: true,
            message: "User statistics fetched successfully",
            data: {
                totalUsers,
                customerUsers,
                sellerUsers,
                adminUsers,
            },
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/users/:id
export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            throw new ApiError(400, "Invalid user ID");
        }

        const user = await User.findById(id)
            .select("-password -refreshToken")
            .lean();

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// PATCH /api/users/:id/role
export const updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Validate user ID
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            throw new ApiError(400, "Invalid user ID");
        }

        // Validate role
        const allowedRoles = ["user", "seller", "admin"];

        if (!allowedRoles.includes(role)) {
            throw new ApiError(400, "Invalid role. Allowed roles: user, seller, admin");
        }

        // Find user
        const user = await User.findById(id);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Prevent an admin from accidentally changing their own role
        if (req.user && String(req.user._id || req.user.id) === String(user._id)) {
            throw new ApiError(400, "You cannot change your own role");
        }

        user.role = role;
        await user.save();

        // Return user without sensitive fields
        const updatedUser = await User.findById(user._id).select("-password -refreshToken").lean();

        return res.status(200).json({
            success: true,
            message: "User role updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};

