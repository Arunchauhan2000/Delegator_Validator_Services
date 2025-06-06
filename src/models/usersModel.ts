import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  walletAddress: string;
  encryptedMnemonic: string;
  username: string;
  createdAt: Date;
  withdrawWalletAddress: string;
  isWithdrawAddressSet: boolean;
  validatorOperatorAddress: string;
  validatorWalletAddress: string;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true },
  walletAddress: { type: String, required: true },
  encryptedMnemonic: { type: String, required: true },
  username: { type: String, required: true },
  createdAt: { type: Date, required: true },
  withdrawWalletAddress: { type: String, default: null },
  validatorOperatorAddress: { type: String, default: null, index: true },
  validatorWalletAddress: { type: String, default: null, index: true },
  isWithdrawAddressSet: { type: Boolean, default: false },
});

export default mongoose.model<IUser>("User", UserSchema, "users");
