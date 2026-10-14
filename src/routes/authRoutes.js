
import { Router } from "express";
import { getMe, login, logout, refreshAccessToken, register } from "../controllers/authController.js";
import { loginValidator, registerValidator } from "../validators/authValidator.js";
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);

router.get("/me", authMiddleware, getMe);

router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);

export default router;
