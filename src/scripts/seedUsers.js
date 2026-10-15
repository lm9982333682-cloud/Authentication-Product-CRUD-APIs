
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../models/userModel.js";

dotenv.config();

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");

        const commonPassword = "Demo@12345";
        const hashedPassword = await bcrypt.hash(commonPassword, 10);

        const users = [
            {
                name: "Aarav Sharma",
                email: "aarav.sharma01@example.com",
                role: "admin",
            },
            {
                name: "Vivaan Verma",
                email: "vivaan.verma02@example.com",
                role: "seller",
            },
            {
                name: "Aditya Singh",
                email: "aditya.singh03@example.com",
                role: "seller",
            },
            {
                name: "Arjun Patel",
                email: "arjun.patel04@example.com",
                role: "seller",
            },
            {
                name: "Sai Kumar",
                email: "sai.kumar05@example.com",
                role: "seller",
            },
            {
                name: "Reyansh Gupta",
                email: "reyansh.gupta06@example.com",
                role: "seller",
            },
            {
                name: "Ayaan Mehta",
                email: "ayaan.mehta07@example.com",
                role: "seller",
            },
            {
                name: "Krishna Joshi",
                email: "krishna.joshi08@example.com",
                role: "seller",
            },
            {
                name: "Ishaan Yadav",
                email: "ishaan.yadav09@example.com",
                role: "seller",
            },
            {
                name: "Shaurya Mishra",
                email: "shaurya.mishra10@example.com",
                role: "seller",
            },
        ];

        const firstNames = [
            "Rahul", "Rohan", "Karan", "Mohit", "Nikhil",
            "Sahil", "Varun", "Deepak", "Manish", "Rajat",
            "Ankit", "Harsh", "Yash", "Tushar", "Gaurav",
            "Abhishek", "Akash", "Sumit", "Tarun", "Piyush",
            "Neha", "Priya", "Ananya", "Sneha", "Pooja",
            "Riya", "Kavya", "Simran", "Isha", "Meera",
            "Aditi", "Nisha", "Sakshi", "Payal", "Tanya",
            "Divya", "Shreya", "Khushi", "Muskan", "Komal",
            "Anjali", "Swati", "Nandini", "Suman", "Kriti",
            "Tanvi", "Ira", "Mahi", "Jiya", "Diya",
            "Dev", "Dhruv", "Kabir", "Om", "Parth",
            "Pranav", "Rishi", "Tejas", "Uday", "Chirag",
            "Lakshya", "Madhav", "Naveen", "Prateek", "Ritesh",
            "Suresh", "Vikas", "Ajay", "Amit", "Bharat",
            "Chandan", "Dinesh", "Esha", "Farhan", "Geeta",
            "Himanshi", "Jyoti", "Kajal", "Lavanya", "Mansi",
            "Namrata", "Ojasvi", "Pallavi", "Radha", "Saloni",
            "Tripti", "Urvi", "Vaishali", "Wamiqa", "Yamini",
        ];

        const lastNames = [
            "Sharma", "Verma", "Singh", "Patel", "Gupta",
            "Kumar", "Joshi", "Yadav", "Mehta", "Mishra",
            "Agarwal", "Jain", "Chauhan", "Saini", "Rathore",
            "Malhotra", "Das", "Reddy", "Shah", "Pawar",
        ];

        // 90 customers with unique names and emails
        for (let i = 0; i < 90; i++) {
            const firstName = firstNames[i];
            const lastName = lastNames[i % lastNames.length];
            const number = String(i + 11).padStart(2, "0");

            users.push({
                name: `${firstName} ${lastName}`,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${number}@example.com`,
                role: "user",
            });
        }

        // Hash the same demo password for all accounts
        const usersWithPasswords = users.map((user) => ({
            ...user,
            password: hashedPassword,
        }));

        // Skip existing email addresses
        const emails = usersWithPasswords.map((user) => user.email);

        const existingUsers = await User.find({
            email: { $in: emails },
        }).select("email");

        const existingEmails = new Set(
            existingUsers.map((user) => user.email.toLowerCase())
        );

        const newUsers = usersWithPasswords.filter(
            (user) => !existingEmails.has(user.email.toLowerCase())
        );

        if (newUsers.length > 0) {
            await User.insertMany(newUsers);
        }

        console.log("Total users in seed list:", usersWithPasswords.length);
        console.log("New users created:", newUsers.length);
        console.log("Existing users skipped:", existingEmails.size);

        console.log("\nDemo login credentials:");
        console.log("Admin: aarav.sharma01@example.com");
        console.log("Seller: vivaan.verma02@example.com");
        console.log("Customer: rahul.sharma11@example.com");
        console.log("Password: Demo@12345");
    } catch (error) {
        console.error("Error seeding users:", error.message);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    }
};

seedUsers();
