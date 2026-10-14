
import { Router } from "express";

import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from "../controllers/productController.js";

import authMiddleware from "../middlewares/authMiddleware.js";

import { createProductValidator, updateProductValidator, productIdValidator, parseProductData, validateImages } from "../validators/productValidator.js";
import multer, { memoryStorage } from "multer";



const upload = multer(memoryStorage({}))



const router = Router();

router.get("/", getAllProducts);

router.get("/:id", productIdValidator, getProductById);

router.post("/", authMiddleware, upload.array('images', 4), parseProductData, validateImages,  createProductValidator, createProduct);

router.put("/:id", authMiddleware,  upload.array("images", 4), productIdValidator, updateProductValidator, updateProduct);

router.delete("/:id", authMiddleware, productIdValidator, deleteProduct);





export default router;
