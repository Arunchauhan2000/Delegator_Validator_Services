import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes"; // Import authRoutes
import { setupSwagger } from "./swagger";
import { AppDataSource } from "./data-source"; // Import AppDataSource

dotenv.config();

const app = express();

app.use(express.json());
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes); // Uncomment and use authRoutes

// Swagger setup
setupSwagger(app);

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`📚 Swagger docs available at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

export default app;
