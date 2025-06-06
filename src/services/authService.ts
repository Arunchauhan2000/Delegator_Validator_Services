// src/services/authService.ts
import bcrypt from "bcrypt";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { generateOtp } from "../utils/otpGenerator";
import { isValidEmail } from "../utils/emailValidator";

import {
  findUserByEmail,
  saveUser,
  updateUser,
  User,
} from "../models/userModel";

import { CheckEmailDto, SendOtpDto, VerifyOtpDto, RegisterDto, Verify2FADto, LoginDto, LoginVerify2FADto, Setup2FARequestDto } from "../dtos/auth.dto";

const OTP_VALIDITY_DURATION = 5 * 60 * 1000; // 5 minutes

export class AuthService {
  static async checkEmail(dto: CheckEmailDto) { // Make async
    console.log('sdfsdsdfsd')
    if (!isValidEmail(dto.email)) {
      return { valid: false, message: "Invalid email format." };
    }
   
    const existingUser = await findUserByEmail(dto.email); // Await DB call
    console.log(existingUser, 'existingUser');
    
    if (existingUser) {
      return { valid: false, message: "Email already registered." };
    }
    return { valid: true };
  }

  static async sendOtp(dto: SendOtpDto) {
    try { // This try block should wrap the main logic
      const user = await findUserByEmail(dto.email); // Await DB call
      if (user) {
        // Consider if you want to allow sending OTP again if u`ser exists but isn't registered
        // For now, it prevents sending OTP if email is in DB at all
        return { success: false, message: "Email already registered." };
      }

      const otp = generateOtp();
      const otpExpiry = Date.now() + OTP_VALIDITY_DURATION;

      console.log('[AuthService] Calling saveUser...'); // Log before calling saveUser
      await saveUser({ email: dto.email, passwordHash: "", otp, otpExpiry }); // Await DB call
      console.log('[AuthService] saveUser completed.'); // Log after calling saveUser

      // TODO: Send OTP via email (mock here)
      console.log(`OTP for ${dto.email} is ${otp}`);

      return { success: true };
    } catch (error: any) { // This catch block needs to be inside the function
      console.error('[AuthService] Error during sendOtp:', error); // Log the full error object
      return { success: false, message: "Failed to send OTP", error: error.message };
    }
  }
  static async verifyOtp(dto: VerifyOtpDto) { // Make async
    const user = await findUserByEmail(dto.email); // Await DB call
    if (!user) {
      return { verified: false, message: "User not found." };
    }
    if (user.otp !== dto.otp) {
      return { verified: false, message: "Invalid OTP." };
    }
    // Ensure otpExpiry is treated as a number for comparison
    const otpExpiryTime = typeof user.otpExpiry === 'number' ? user.otpExpiry : 0;
    if (Date.now() > otpExpiryTime) {
      return { verified: false, message: "OTP expired." };
    }
    // OTP verified, clear otp and otpExpiry for security
    // Assuming updateUser is a Mongoose operation or similar async DB call
    await updateUser(dto.email, { otp: undefined, otpExpiry: undefined }); // Await DB call
    return { verified: true };
  }

  static async registerUser(dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      return { success: false, message: "Passwords do not match." };
    }

    // Assuming findUserByEmail is a Mongoose operation or similar async DB call
    const existingUser = await findUserByEmail(dto.email); // Await DB call
    if (!existingUser) {
      return { success: false, message: "User not found, please verify email first." };
    }

    if (existingUser.passwordHash) {
      return { success: false, message: "User already registered." };
    }

    // Encrypt password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    // Assuming updateUser is a Mongoose operation or similar async DB call
    await updateUser(dto.email, { passwordHash: hashedPassword }); // Await DB call
    return { success: true };
  }

  // --- 2FA Methods ---

  static async generate2FAProvisionalSecret(email: string): Promise<{
    success: boolean;
    message?: string;
    otpauth_url?: string;
    base32_secret?: string;
    qr_code_data_url?: string;
  }> {
    const user = await findUserByEmail(email);
    if (!user) {
      return { success: false, message: "User not found." };
    }
    // Optional: Check if 2FA is already enabled or setup is in progress
    // if (user.isTwoFactorEnabled) {
    //   return { success: false, message: "2FA is already enabled for this user." };
    // }

    const secret = speakeasy.generateSecret({
      name: `YourAppName:${user.email}`, // Customize with your app name
    });

    // Store the provisional secret (secret.base32) in the user model
    // Ensure your updateUser function can handle 'twoFactorProvisionalSecret'
    await updateUser(email, { twoFactorProvisionalSecret: secret.base32 });

    const otpauth_url = secret.otpauth_url!;
    let qr_code_data_url = "";
    try {
      qr_code_data_url = await qrcode.toDataURL(otpauth_url);
    } catch (err) {
      console.error("Error generating QR code data URL", err);
      return { success: false, message: "Could not generate QR code data." };
    }

    return {
      success: true,
      otpauth_url: otpauth_url,
      base32_secret: secret.base32, // For manual entry / backup
      qr_code_data_url: qr_code_data_url, // Client can use this to display QR code
    };
  }

  static async verifyAndEnable2FA(dto: Verify2FADto): Promise<{ success: boolean; message: string }> {
    const user = await findUserByEmail(dto.email);
    if (!user || !user.twoFactorProvisionalSecret) {
      return { success: false, message: "2FA setup not initiated or user not found." };
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorProvisionalSecret,
      encoding: "base32",
      token: dto.token,
      window: 1, // Allow 1 time window drift (e.g., 30 seconds on either side)
    });

    if (verified) {
      // Move provisional secret to final secret, enable 2FA, and clear provisional
      await updateUser(dto.email, {
        twoFactorSecret: user.twoFactorProvisionalSecret,
        isTwoFactorEnabled: true,
        twoFactorProvisionalSecret: undefined, // Clear the provisional secret
      });
      return { success: true, message: "2FA enabled successfully." };
    } else {
      return { success: false, message: "Invalid 2FA token. Please try again." };
    }
  }

  static async validateLogin2FAToken(email: string, token: string): Promise<boolean> {
    const user = await findUserByEmail(email);
    if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
      return false; // User not found, 2FA not enabled, or secret missing
    }
    return speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token,
      window: 1,
    });
  }

  static async loginUser(dto: LoginDto): Promise<{
    success: boolean;
    message: string;
    token?: string; // For JWT
    requires2FA?: boolean;
    // You might want to return some user data as well
  }> {
    const user = await findUserByEmail(dto.email);
    if (!user) {
      return { success: false, message: "Invalid email or password." };
    }

    if (!user.passwordHash) {
      // This case might mean user completed OTP but not registration, or an anomaly
      return { success: false, message: "User registration not complete or password not set." };
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      return { success: false, message: "Invalid email or password." };
    }

    if (user.isTwoFactorEnabled) {
      return { success: true, requires2FA: true, message: "Please provide your 2FA token." };
    }

    // Login successful, 2FA not enabled. Issue JWT or session.
    // const jwtToken = generateJwtToken(user.id, user.email); // Implement this
    // For now, just a success message
    return { success: true, message: "Login successful.", token: "dummy-jwt-token-replace-me" };
  }
}
