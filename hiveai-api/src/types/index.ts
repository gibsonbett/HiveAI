import { Request } from 'express';
import { Document, Types } from 'mongoose';
import { UserRole, UserStatus, KycStatus, SubscriptionPlan, SubscriptionStatus } from '../constants';

export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  walletBalance: number;
  pendingBalance: number;
  accuracyScore: number;
  trustScore: number;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEndsAt?: Date;
  trialUsageCount: number;
  status: UserStatus;
  kycStatus: KycStatus;
  skills: string[];
  devices: IDevice[];
  emailVerified: boolean;
  emailVerifyToken?: string;
  emailVerifyExpiry?: Date;
  approvalToken?: string;
  approvalTokenExpiry?: Date;
  approvedAt?: Date;
  approvedBy?: Types.ObjectId;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  refreshTokens: string[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDevice {
  userAgent: string;
  ip: string;
  lastUsed: Date;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
