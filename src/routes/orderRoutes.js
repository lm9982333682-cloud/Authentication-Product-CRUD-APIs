
import express from "express";

import { createOrder, getAllOrders, getMyOrders, getOrderById, getOrderStats, updateOrderNotes, updateOrderStatus, } from "../controllers/orderController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

import { createOrderValidator, orderIdValidator, } from "../validators/orderValidator.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Create order (logged-in customer)
router.post("/", createOrderValidator, createOrder);

// Get logged-in user's orders
router.get("/", getMyOrders);

router.get("/admin/all", adminMiddleware, getAllOrders);


// Get a specific order
router.get("/:id", orderIdValidator, getOrderById);

// Update order status (admin only)
router.patch("/:id/status", adminMiddleware, orderIdValidator, updateOrderStatus);


router.patch("/:id/notes", adminMiddleware, orderIdValidator, updateOrderNotes);



router.get("/admin/stats", adminMiddleware, getOrderStats);




export default router;
