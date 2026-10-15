
import "dotenv/config";
import mongoose from "mongoose";

import User from "../models/userModel.js";
import Product from "../models/productModel.js";

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        // Step 1: Database se seller users aur unki IDs lo
        const users = await User.find({ role: "seller" })
            .select("_id name")
            .lean();

        if (!users.length) {
            throw new Error(
                "No seller users found. Please seed users first."
            );
        }

        console.log(`Found ${users.length} sellers`);

        // Step 2: Online se products ka data lo
        const limit = 100;
        const skip = 0;

        const response = await fetch(
            `https://dummyjson.com/products?limit=${limit}&skip=${skip}`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }

        const result = await response.json();

        console.log("Total available:", result.total);
        console.log("Products fetched:", result.products.length);

        // Step 3: Sabhi available product images ka pool
        const allImages = [
            ...new Set(
                result.products
                    .flatMap((product) => product.images || [])
                    .filter(Boolean)
            ),
        ];

        // Step 4: Product data ka array prepare karo
        const productData = result.products.map((product, index) => {
            const ownImages = [
                ...new Set(
                    [product.thumbnail, ...(product.images || [])]
                        .filter(Boolean)
                ),
            ];

            const images = [...ownImages];

            for (
                let i = 0;
                images.length < 4 && i < allImages.length;
                i++
            ) {
                const image =
                    allImages[(index * 4 + i) % allImages.length];

                if (!images.includes(image)) {
                    images.push(image);
                }
            }

            return {
                title: product.title,
                description: product.description,
                price: product.price,
                images: images.slice(0, 4),
                sizes: ["S", "M", "L", "XL"],
                category: product.category,
                stock: 10 + ((index * 7) % 91),
                status: index % 10 === 0 ? "Inactive" : "Active",

                // Actual MongoDB seller ID
                seller: users[index % users.length]._id,
            };
        });

        // Step 5: Existing products ke titles database se lo
        const existingProducts = await Product.find({
            title: {
                $in: productData.map((product) => product.title),
            },
        })
            .select("title")
            .lean();

        const existingTitles = new Set(
            existingProducts.map((product) => product.title)
        );

        // Step 6: Sirf naye products select karo
        const newProducts = productData.filter(
            (product) => !existingTitles.has(product.title)
        );

        if (!newProducts.length) {
            console.log("All these products already exist. Nothing to insert.");
            return;
        }

        // Step 7: Sirf naye products create karo
        await Product.insertMany(newProducts);

        console.log("New products seeded successfully!");
        console.log(`Products fetched: ${productData.length}`);
        console.log(`Already existing: ${existingTitles.size}`);
        console.log(`New products created: ${newProducts.length}`);
        console.log(`Available sellers: ${users.length}`);

    } catch (error) {
        console.error("Product seeding failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

seedProducts();