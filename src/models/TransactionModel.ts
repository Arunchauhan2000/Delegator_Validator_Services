import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITransaction extends Document {
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  timestamp: Date;
  txType: string; 
  txTypeId: number; 
  delegatorId: Types.ObjectId;
  validatorId: Types.ObjectId;
  validatorOperatorAddress: string;
}

const TransactionSchema = new Schema<ITransaction>({
  txHash: { type: String, required: true },
  fromAddress: { type: String, required: true },
  toAddress: { type: String, required: true },
  amount: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  txType: { type: String, required: true }, 
  txTypeId: { type: Number, required: true },
  delegatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  validatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  validatorOperatorAddress: { type: String, required: true },
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema, 'transactions');
