import express from "express";
import { UserController } from "../controllers/userController";

const router = express.Router();

// Wrap async handler to catch errors properly
router.post("/generateotpforemailForRegister", async (req, res, next) => {
    console.log("Route hit for generateOtpForEmail");
    try {
      await UserController.generateOtpForEmail(req, res);
    } catch (err) {
      console.error("Error in route:", err);
      next(err);
    }
  });
  
export default router;
