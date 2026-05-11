import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types';
import { UserRole, UserStatus, KycStatus, SubscriptionPlan, SubscriptionStatus } from '../constants';

const deviceSchema = new Schema(
  {
    userAgent: { type: String, required: true },
    ip: { type: String, required: true },
    lastUsed: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, sparse: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.WORKER },
    walletBalance: { type: Number, default: 0, min: 0 },
    pendingBalance: { type: Number, default: 0, min: 0 },
    accuracyScore: { type: Number, default: 100, min: 0, max: 100 },
    trustScore: { type: Number, default: 100, min: 0, max: 100 },
    subscriptionPlan: { type: String, enum: Object.values(SubscriptionPlan), default: SubscriptionPlan.FREE },
    subscriptionStatus: { type: String, enum: Object.values(SubscriptionStatus), default: SubscriptionStatus.INACTIVE },
    subscriptionEndsAt: { type: Date },
    trialUsageCount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE },
    kycStatus: { type: String, enum: Object.values(KycStatus), default: KycStatus.NOT_STARTED },
    skills: [{ type: String, trim: true }],
    devices: [deviceSchema],
    emailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String, select: false },
    emailVerifyExpiry: { type: Date, select: false },
    approvalToken: { type: String, select: false },
    approvalTokenExpiry: { type: Date, select: false },
    approvedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    passwordResetToken: { type: String, select: false },
    passwordResetExpiry: { type: Date, select: false },
    refreshTokens: { type: [String], select: false },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret['passwordHash'];
        delete ret['refreshTokens'];
        delete ret['__v'];
        return ret;
      },
    },
  }
);

userSchema.index({ role: 1, status: 1 });
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ approvalToken: 1, approvalTokenExpiry: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
