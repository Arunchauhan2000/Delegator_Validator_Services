// src/dtos/auth.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, Length } from 'class-validator';

export class CheckEmailDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Email should not be empty.' })
  email!: string;
}

export class SendOtpDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Email should not be empty.' })
  email!: string;
}

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Email should not be empty.' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'OTP should not be empty.' })
  @MinLength(6, { message: 'OTP must be at least 6 characters long.' }) // Assuming OTP is 6 digits
  otp!: string;
}

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Email should not be empty.' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  // Example: Add regex for password complexity if needed
  // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, { message: 'Password too weak' })
  password!: string;
  
  @IsString()
  @IsNotEmpty({ message: 'Confirm password should not be empty.' })
  confirmPassword!: string;

  @IsString()
  @IsNotEmpty({ message: 'OTP should not be empty.' })
  @MinLength(6, { message: 'OTP must be at least 6 characters long.' })
  otp!: string;
}

export class Verify2FADto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Email should not be empty.' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: '2FA token should not be empty.' })
  // Google Authenticator typically generates 6-digit codes
  @Length(6, 6, { message: '2FA token must be 6 digits.' })
  token!: string;
}

export class Setup2FARequestDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Email should not be empty.' })
  email!: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Email should not be empty.' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password should not be empty.' })
  password!: string;
}

export class LoginVerify2FADto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Email should not be empty.' })
  email!: string; // Or userId if you prefer to pass that after initial login step

  @IsString()
  @IsNotEmpty({ message: '2FA token should not be empty.' })
  @Length(6, 6, { message: '2FA token must be 6 digits.' })
  token!: string;
}