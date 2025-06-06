import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";

export class AuthController {
  static checkEmail = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {    
    try {
      const result = await AuthService.checkEmail(req.body);
      if (!result.valid) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  };

  static sendOtp = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const result = await AuthService.sendOtp(req.body);
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  };
  

  static verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    
    try {
      const result = await AuthService.verifyOtp(req.body);
      if (!result.verified) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  };

  static registerUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  console.log(`[AuthController] registerUser called. Body:`, req.body); // DEBUG LOG
    try {
      const result = await AuthService.registerUser(req.body);
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
    console.error(`[AuthController] Error in registerUser:`, error); // DEBUG LOG FOR ERROR
      next(error);
    }
  };

  // --- 2FA Controller Methods ---

  static setup2FA = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    // req.body is now Setup2FARequestDto due to validateBody middleware
    const { email } = req.body;
 
    try {
      const result = await AuthService.generate2FAProvisionalSecret(email);
      if (!result.success) return res.status(400).json(result); // Or a more appropriate status code
      return res.json(result);
    } catch (error) {
      next(error);
    }
  };

  static verifyAndEnable2FA = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    // req.body will be validated by `validateBody(Verify2FADto)` middleware
    try {
      const result = await AuthService.verifyAndEnable2FA(req.body); // req.body is now Verify2FADto
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  };

  static loginUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    // req.body will be LoginDto
    try {
      const result = await AuthService.loginUser(req.body);
      if (!result.success) {
        return res.status(401).json(result); // Unauthorized for login failures
      }
      // If result.requires2FA is true, client needs to make another call
      return res.json(result);
    } catch (error) {
      next(error);
    }
  };

  static verifyLogin2FA = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    // req.body will be LoginVerify2FADto
    const { email, token } = req.body;
    try {
      const isValidToken = await AuthService.validateLogin2FAToken(email, token);
      if (!isValidToken) {
        return res.status(401).json({ success: false, message: "Invalid 2FA token." });
      }
      // Issue JWT or session here
      return res.json({ success: true, message: "2FA verified, login successful.", token: "dummy-jwt-token-replace-me-for-2fa-login" });
    } catch (error) {
      next(error);
    }
  };
}
