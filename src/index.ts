import app from "./app";
import { connectDB } from "./config/dbconnection";
import dotenv from "dotenv";

dotenv.config(); // Ensure .env variables are loaded

const PORT = process.env.PORT || 4000; // Ek hi jagah PORT define karein

(async () => {
  try {
    await connectDB();  // Mongoose DB connection
    app.listen(PORT, () => {
      console.log(`⚡ Server running at http://localhost:${PORT}`);
      console.log(`📚 Swagger docs available at http://localhost:${PORT}/api-docs`); // Swagger log yahan move kar sakte hain
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);  // Stop the app
  }
})();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                             