// src/services/authService.ts
import bcrypt from "bcrypt";
import { generateOtp } from "../utils/otpGenerator";
import { isValidEmail } from "../utils/emailValidator";

import {
  findUserByEmail,
  saveUser,
  updateUser,
  User,
} from "../models/userModel";

import { CheckEmailDto, SendOtpDto, VerifyOtpDto, RegisterDto } from "../dtos/auth.dto";

const OTP_VALIDITY_DURATION = 5 * 60 * 1000; // 5 minutes

export class AuthService {
  static checkEmail(dto: CheckEmailDto) {
    console.log('sdfsdsdfsd')
    if (!isValidEmail(dto.email)) {
      return { valid: false, message: "Invalid email format." };
    }
   
    const existingUser = findUserByEmail(dto.email);
    console.log(existingUser, 'existingUser');
    
    if (existingUser) {
      return { valid: false, message: "Email already registered." };
    }
    return { valid: true };
  }

  static async sendOtp(dto: SendOtpDto) {
    const user = findUserByEmail(dto.email);
    if (user) {
      return { success: false, message: "Email already registered." };
    }

    const otp = generateOtp();
    const otpExpiry = Date.now() + OTP_VALIDITY_DURATION;

    // Simulate saving user with OTP (but no password yet)
    saveUser({ email: dto.email, passwordHash: "", otp, otpExpiry });

    // TODO: Send OTP via email (mock here)
    console.log(`OTP for ${dto.email} is ${otp}`);

    return { success: true };
  }

  static verifyOtp(dto: VerifyOtpDto) {
    const user = findUserByEmail(dto.email);
    if (!user) {
      return { verified: false, message: "User not found." };
    }
    if (user.otp !== dto.otp) {
      return { verified: false, message: "Invalid OTP." };
    }
    if (Date.now() > (user.otpExpiry ?? 0)) {
      return { verified: false, message: "OTP expired." };
    }
    // OTP verified, clear otp and otpExpiry for security
    updateUser(dto.email, { otp: undefined, otpExpiry: undefined });
    return { verified: true };
  }

  static async registerUser(dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      return { success: false, message: "Passwords do not match." };
    }

    const existingUser = findUserByEmail(dto.email);
    if (!existingUser) {
      return { success: false, message: "User not found, please verify email first." };
    }

    if (existingUser.passwordHash) {
      return { success: false, message: "User already registered." };
    }

    // Encrypt password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    updateUser(dto.email, { passwordHash: hashedPassword });
    return { success: true };
  }
}
