
import express from "express";
import { getAllUsers, getUserById, getUserStats, updateUserRole, } from "../controllers/userController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/", getAllUsers);
router.get("/stats", getUserStats);
router.patch("/:id/role", updateUserRole);
router.get("/:id", getUserById);

export default router;