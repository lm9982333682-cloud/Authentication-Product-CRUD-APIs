
import "dotenv/config";
import mongoose from "mongoose";

import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";

const seedOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        // Step 1: Customer users fetch karo
        const users = await User.find({ role: "user" })
            .select("_id name")
            .lean();

        if (!users.length) {
            throw new Error("No customer users found. Seed users first.");
        }

        console.log(`Found ${users.length} customers`);

        // Step 2: Active products fetch karo
        const products = await Product.find({
            status: "Active",
            stock: { $gt: 0 },
        })
            .select("_id title price stock")
            .lean();

        if (!products.length) {
            throw new Error("No active products found. Seed products first.");
        }

        console.log(`Found ${products.length} active products`);

        // Step 3: Existing order combinations se duplicate avoid karo
        const existingOrders = await Order.find()
            .select("notes")
            .lean();

        const existingNotes = new Set(
            existingOrders.map((order) => order.notes).filter(Boolean)
        );

        // Step 4: Sample orders prepare karo
        const orderCount = 100;
        const statuses = [
            "pending",
            "confirmed",
            "shipped",
            "delivered",
            "cancelled",
        ];

        const orderData = [];

        for (let i = 0; i < orderCount; i++) {
            const notes = `SEED_ORDER_${Date.now()}_${i + 1}`;

            if (existingNotes.has(notes)) {
                continue;
            }

            // Har order mein 1 se 3 products
            const itemCount = Math.min(
                1 + (i % 3),
                products.length
            );

            const selectedProducts = [];

            for (let j = 0; j < itemCount; j++) {
                const productIndex =
                    (i * 3 + j) % products.length;

                const product = products[productIndex];

                // Ek order mein same product dobara add na ho
                if (
                    !selectedProducts.some(
                        (item) => item.product.toString() ===
                            product._id.toString()
                    )
                ) {
                    selectedProducts.push({
                        product: product._id,
                        quantity: 1 + ((i + j) % 3),
                        price: product.price,
                    });
                }
            }

            const totalAmount = selectedProducts.reduce(
                (total, item) =>
                    total + item.price * item.quantity,
                0
            );

            orderData.push({
                user: users[i % users.length]._id,
                items: selectedProducts,
                totalAmount: Number(totalAmount.toFixed(2)),
                status: statuses[i % statuses.length],
                notes,
            });
        }

        // Step 5: Sirf naye orders insert karo
        if (!orderData.length) {
            console.log("No new orders to create.");
            return;
        }

        await Order.insertMany(orderData);

        console.log("Orders seeded successfully!");
        console.log(`Customers available: ${users.length}`);
        console.log(`Products available: ${products.length}`);
        console.log(`New orders created: ${orderData.length}`);

    } catch (error) {
        console.error("Order seeding failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

seedOrders();