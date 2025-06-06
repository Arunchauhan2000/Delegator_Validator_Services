// /home/ubuntu/Delegator_Validator_Services/src/config/dbconnection.ts
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

// Aap is line ko debugging ke liye rakh sakte hain, production mein hata sakte hain
console.log("Attempting to connect with MONGO_URI:", MONGO_URI ? "URI is set" : "URI is NOT SET");

export const connectDB = async (): Promise<void> => {
  try {
    if (!MONGO_URI) {
      console.error("❌ MONGO_URI is not defined in environment variables.");
      process.exit(1);
    }
    await mongoose.connect(MONGO_URI);
    // 👇 Yeh hai successful connection ka log
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    // 👇 Yeh hai connection failure ka log
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1); // Application band kar dena sahi hai agar DB connect na ho
  }
};
