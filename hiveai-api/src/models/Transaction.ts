import mongoose, { Schema, Document, Types } from 'mongoose';
import { TransactionType, TransactionStatus } from '../constants';

export interface ITransaction extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: TransactionType;
  amount: number;
  mpesaReceipt?: string;
  transactionId?: string;
  status: TransactionStatus;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: Object.values(TransactionType), required: true },
    amount: { type: Number, required: true },
    mpesaReceipt: { type: String },
    transactionId: { type: String },
    status: { type: String, enum: Object.values(TransactionStatus), default: TransactionStatus.PENDING },
    description: { type: String, required: true, trim: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ mpesaReceipt: 1 }, { sparse: true });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
