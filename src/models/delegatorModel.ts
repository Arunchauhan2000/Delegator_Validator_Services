import mongoose, { Document, Schema, Types } from "mongoose";

export interface IValidatorEntry {
  validatorId: Types.ObjectId;
  validatorWalletAddress: string;
  amount: string;
  validatorUsername: string;
  createdAt: Date;
}

export interface IDelegatorRecord extends Document {
  userId: Types.ObjectId;  // Reference to User collection
  email: string;
  walletAddress: string;
  validators: IValidatorEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const ValidatorSchema = new Schema<IValidatorEntry>(
  {
    validatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    validatorWalletAddress: { type: String, required: true },
    amount: { type: String, required: true },
    validatorUsername: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  { _id: false }  // disables automatic _id creation for embedded validator entries
);

const DelegatorSchema = new Schema<IDelegatorRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true, unique: true, index: true },
    walletAddress: { type: String, required: true },
    validators: { type: [ValidatorSchema], default: [] },
  },
  {
    timestamps: true,  // automatically manages createdAt and updatedAt
  }
);

export default mongoose.model<IDelegatorRecord>("Delegator", DelegatorSchema, "delegators");
