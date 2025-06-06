import app from "./app";
import { connectDB } from "./config/dbconnection";

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connectDB();  // Wait for DB connection
    app.listen(PORT, () => {
      console.log(`⚡ Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server because DB connection failed");
    process.exit(1);  // Stop the app
  }
})();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                             