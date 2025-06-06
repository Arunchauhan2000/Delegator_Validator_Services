import express, { RequestHandler } from "express";
import { AuthController } from "../controllers/authController";
import { validateBody } from "../utils/validate";
import { CheckEmailDto, SendOtpDto, VerifyOtpDto, RegisterDto, Verify2FADto, Setup2FARequestDto, LoginDto, LoginVerify2FADto } from "../dtos/auth.dto";

const router = express.Router();

router.use(express.json()); // Ensure body parsing for these routes

router.post("/check-email", validateBody(CheckEmailDto), AuthController.checkEmail as RequestHandler);
router.post("/send-otp", validateBody(SendOtpDto), AuthController.sendOtp as RequestHandler);
router.post("/verify-otp", validateBody(VerifyOtpDto), AuthController.verifyOtp as RequestHandler);
router.post("/register", validateBody(RegisterDto), AuthController.registerUser as RequestHandler);
router.post("/login", validateBody(LoginDto), AuthController.loginUser as RequestHandler);

// 2FA Routes
// For setup, ensure the user is authenticated or provide email if it's part of an initial setup flow
router.post("/2fa/setup", validateBody(Setup2FARequestDto), AuthController.setup2FA as RequestHandler);
router.post("/2fa/verify-enable", validateBody(Verify2FADto), AuthController.verifyAndEnable2FA as RequestHandler);
// Route for verifying 2FA token during login
router.post("/login/verify-2fa", validateBody(LoginVerify2FADto), AuthController.verifyLogin2FA as RequestHandler);


export default router; // ✅ MAKE SURE THIS LINE EXISTS
