import { Request, Response } from "express";
import { sendOtpToEmail } from "../utils/otpService";

export const UserController = {
    generateOtpForEmail: async (req: Request, res: Response) => {
      console.log("Request body:", req.body); // check request aa rahi hai ya nahi
  
      const { email } = req.body;
  
      if (!email) {
        console.log("Email missing");
        return res.status(400).json({ message: "Email is required" });
      }
  
      try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log("Generated OTP:", otp);
  
        // Temporarily comment this out if you suspect sendOtpToEmail issue
        // await sendOtpToEmail(email, otp);
  
        return res.status(200).json({
          message: "OTP sent to email successfully",
          email,
          otp,  // for testing, remove later
        });
      } catch (error) {
        console.error("Error sending OTP:", error);
        return res.status(500).json({ message: "Failed to send OTP", error });
      }
    },
  };
  
