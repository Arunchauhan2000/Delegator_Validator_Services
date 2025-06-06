import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes"; // Import authRoutes
import { setupSwagger } from "./swagger";
// import { AppDataSource } from "./data-source"; // Isko yahan se hata dein agar index.ts Mongoose use kar raha hai

dotenv.config();

const app = express();

app.use(express.json());
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes); // Uncomment and use authRoutes

// Swagger setup
setupSwagger(app);

export default app;
