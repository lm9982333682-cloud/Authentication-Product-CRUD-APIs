
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config/config.js";
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import errorMiddleware from './middlewares/errorMiddleware.js'
import dashboardRoutes from "./routes/dashboardRoutes.js";

import userRoutes from './routes/userRoutes.js';


const app = express();

app.use(cors({
    origin: config.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Authentication Product CRUD API is running"
    });
});

app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);

http://localhost:4500/api
app.use("/api/orders", orderRoutes);

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);


// Error handling — always after routes
app.use(errorMiddleware);




export default app;
