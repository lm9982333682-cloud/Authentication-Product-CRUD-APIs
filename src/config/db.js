
import mongoose from "mongoose";
import config from './config.js';

const connectDB = async () => {
    try {
    const res =  await mongoose.connect(config.MONGO_URI);
        console.log("MongoDB connected successfully", res.connection.host );
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
         throw error;
    }
};

export default connectDB;
