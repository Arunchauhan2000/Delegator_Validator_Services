// /home/ubuntu/Delegator_Validator_Services/src/models/userModel.ts
import mongoose, { Document, Schema } from 'mongoose';

// Interface for User document
export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  otp?: string;
  otpExpiry?: number;
  // 2FA fields
  twoFactorSecret?: string;
  isTwoFactorEnabled?: boolean;
  twoFactorProvisionalSecret?: string;
  // Add other existing fields here
}

// Mongoose schema
const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  otp: { type: String },
  otpExpiry: { type: Number },
  // 2FA fields
  twoFactorSecret: { type: String },
  isTwoFactorEnabled: { type: Boolean, default: false },
  twoFactorProvisionalSecret: { type: String },
  // Add other existing fields here
});

// Export the model and potentially the functions
export const User = mongoose.model<IUser>('User', UserSchema);

// Your existing functions like findUserByEmail, saveUser, updateUser
// These would need to be adapted if they are not already part of the model
// For example:
export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  return User.findOne({ email }).exec();
};

export const saveUser = async (userData: Partial<IUser>): Promise<IUser> => {
  console.log('[userModel] saveUser called with data:', userData); // Log input data
  try {
    const newUser = new User(userData);
    console.log('[userModel] Attempting to save new user instance:', newUser); // Log instance before save
    const savedUser = await newUser.save();
    console.log('[userModel] User saved successfully:', savedUser); // Log success
    return savedUser;
  } catch (error) {
    console.error('[userModel] Error saving user:', error); // Log error during save
    throw error; // Re-throw the error so AuthService can catch it
  }
};

export const updateUser = async (email: string, updateData: Partial<IUser>): Promise<IUser | null> => {
  return User.findOneAndUpdate({ email }, { $set: updateData }, { new: true }).exec();
};
