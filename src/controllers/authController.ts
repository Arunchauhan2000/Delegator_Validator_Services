import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";

export class AuthController {
  static checkEmail = (req: Request, res: Response, next: NextFunction): Response | void => {
    try {
      console.log('ddsfsdf', req.body);
      
      const result = AuthService.checkEmail(req.body);
      if (!result.valid) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  };

  static sendOtp = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    console.log("Request Body:", req.body);  // Check what body you receive
    console.log(req);
    
    try {
      const result = await AuthService.sendOtp(req.body);
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  };
  

  static verifyOtp = (req: Request, res: Response, next: NextFunction): Response | void => {
    
    try {
      const result = AuthService.verifyOtp(req.body);
      if (!result.verified) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  };

  static registerUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const result = await AuthService.registerUser(req.body);
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
