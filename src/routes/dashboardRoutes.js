import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.get(
    "/stats",
    authMiddleware,
    adminMiddleware,
    getDashboardStats
);

export default router;