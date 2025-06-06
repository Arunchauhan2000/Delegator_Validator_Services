import express, { RequestHandler } from "express";
import { AuthController } from "../controllers/authController";
import { validateBody } from "../utils/validate";
import { CheckEmailDto, SendOtpDto, VerifyOtpDto, RegisterDto } from "../dtos/auth.dto";

const router = express.Router();

router.use(express.json()); // Ensure body parsing for these routes

router.post("/check-email", validateBody(CheckEmailDto), AuthController.checkEmail as RequestHandler);
router.post("/send-otp", validateBody(SendOtpDto), AuthController.sendOtp as RequestHandler);
router.post("/verify-otp", validateBody(VerifyOtpDto), AuthController.verifyOtp as RequestHandler);
router.post("/register", validateBody(RegisterDto), AuthController.registerUser as RequestHandler);

export default router; // ✅ MAKE SURE THIS LINE EXISTS
