
import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import { generateAccessToken, generateRefreshToken } from "../services/tokenService.js";
import config from "../config/config.js";
import jwt from 'jsonwebtoken'


const cookieOption = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
        });


    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered",
            });
        }

        console.error("Register error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};



export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie("refreshToken", refreshToken, cookieOption);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
        });

    } catch (error) {
        console.error("Get profile error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};



export const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is required",
            });
        };



        let decoded;

        try {

            decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET);


        } catch {
            console.log(decoded)
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token",
            });
        };



        const user = await User.findById(decoded.userId)
            .select("+refreshToken");

        if (!user || user.refreshToken !== refreshToken) {

            await User.findByIdAndUpdate(user._id, { refreshToken: null });


            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: config.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
            });

            return res.status(401).json({
                success: false,
                message: "Refresh token is invalid or revoked",
            });
        }

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });


        res.cookie("refreshToken", newRefreshToken, cookieOption);

        return res.status(200).json({
            success: true,
            message: "Access token refreshed successfully",
            accessToken: newAccessToken,
        });




    } catch (error) {

        console.error("Refresh token error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            await User.updateOne({ refreshToken },
                { $set: { refreshToken: null } }
            );
        }

        res.clearCookie("refreshToken", cookieOption);

        return res.status(200).json({
            success: true,
            message: "Logout successful",
        });


    } catch (error) {
        console.error("Logout error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};



