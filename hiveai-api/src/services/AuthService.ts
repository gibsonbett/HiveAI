import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { userRepository } from '../repositories/UserRepository';
import { AppError } from '../middlewares/errorHandler';
import { NotificationType, UserRole, UserStatus } from '../constants';
import { JwtPayload, IUser } from '../types';
import { enqueueEmail } from '../jobs';
import { notificationService } from './NotificationService';
import { emitToRole, emitToUser } from '../sockets';

class AuthService {
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    role?: UserRole;
  }): Promise<{ user: IUser; accessToken?: string; refreshToken?: string }> {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    if (data.role === UserRole.ADMIN) {
      throw new AppError('Admin accounts cannot be created from public signup', 403);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');
    const approvalToken = crypto.randomBytes(32).toString('hex');

    const user = await userRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      passwordHash,
      role: data.role || UserRole.WORKER,
      status: UserStatus.PENDING,
      emailVerifyToken,
      emailVerifyExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      approvalToken,
      approvalTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    // Send verification email (via queue for non-blocking)
    enqueueEmail({ type: 'verification', to: user.email, firstName: user.firstName, token: emailVerifyToken });

    // Notify active admins by email and in-app notification.
    const admins = await userRepository.findActiveAdmins();
    await Promise.all(
      admins.map(async (admin) => {
        await enqueueEmail({
          type: 'signup-approval-request',
          to: admin.email,
          firstName: admin.firstName,
          adminFirstName: admin.firstName,
          token: approvalToken,
          userId: user._id.toString(),
          applicant: {
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            email: user.email,
          },
        });

        const notification = await notificationService.create({
          userId: admin._id.toString(),
          type: NotificationType.SYSTEM,
          title: 'New account pending approval',
          message: `${user.firstName} ${user.lastName} signed up as ${user.role}.`,
          metadata: {
            category: 'user_approval',
            applicantUserId: user._id.toString(),
            applicantEmail: user.email,
            applicantRole: user.role,
          },
        });

        emitToUser(admin._id.toString(), 'notification', notification);
      })
    );

    emitToRole(UserRole.ADMIN, 'notification', {
      title: 'New account pending approval',
      message: `${user.firstName} ${user.lastName} signed up as ${user.role}.`,
      metadata: {
        category: 'user_approval',
        applicantUserId: user._id.toString(),
      },
    });

    return { user };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.status === UserStatus.BANNED) {
      throw new AppError('Account has been banned', 403);
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AppError('Account has been suspended', 403);
    }

    if (user.status === UserStatus.PENDING) {
      throw new AppError('Your account is awaiting admin approval', 403);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    await userRepository.updateById(user._id.toString(), { lastLogin: new Date() });

    const { accessToken, refreshToken } = await this.generateTokens(user);

    return { user, accessToken, refreshToken };
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await userRepository.removeRefreshToken(userId, refreshToken);
  }

  async refreshTokens(
    oldRefreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: JwtPayload;
    try {
      payload = jwt.verify(oldRefreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }

    const user = await userRepository.findById(payload.userId, true);
    if (!user || !user.refreshTokens?.includes(oldRefreshToken)) {
      if (user) {
        await userRepository.clearRefreshTokens(user._id.toString());
      }
      throw new AppError('Invalid refresh token — possible token reuse', 401);
    }

    await userRepository.removeRefreshToken(user._id.toString(), oldRefreshToken);

    return this.generateTokens(user);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user) return; // Don't reveal if email exists

    const resetToken = crypto.randomBytes(32).toString('hex');
    await userRepository.updateById(user._id.toString(), {
      passwordResetToken: resetToken,
      passwordResetExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    enqueueEmail({ type: 'password-reset', to: user.email, firstName: user.firstName, token: resetToken });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await userRepository.findByResetToken(token);
    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await userRepository.updateById(user._id.toString(), {
      passwordHash,
      passwordResetToken: undefined,
      passwordResetExpiry: undefined,
    });

    await userRepository.clearRefreshTokens(user._id.toString());
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await userRepository.findByVerifyToken(token);
    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    await userRepository.updateById(user._id.toString(), {
      emailVerified: true,
      emailVerifyToken: undefined,
      emailVerifyExpiry: undefined,
    });
  }

  async approveSignupByToken(userId: string, token: string): Promise<IUser> {
    const user = await userRepository.findById(userId, true);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.status === UserStatus.ACTIVE) {
      return user;
    }

    if (!user.approvalToken || !user.approvalTokenExpiry || user.approvalTokenExpiry <= new Date()) {
      throw new AppError('Approval link is invalid or expired', 400);
    }

    if (user.approvalToken !== token) {
      throw new AppError('Approval link is invalid or expired', 400);
    }

    const approvedUser = await userRepository.updateById(userId, {
      status: UserStatus.ACTIVE,
      approvalToken: undefined,
      approvalTokenExpiry: undefined,
      approvedAt: new Date(),
    });

    if (!approvedUser) {
      throw new AppError('User not found', 404);
    }

    await enqueueEmail({
      type: 'signup-approved',
      to: approvedUser.email,
      firstName: approvedUser.firstName,
    });

    const notification = await notificationService.create({
      userId: approvedUser._id.toString(),
      type: NotificationType.SYSTEM,
      title: 'Account approved',
      message: 'Your account has been approved. You can now log in.',
      metadata: { category: 'user_approval', status: 'approved' },
    });
    emitToUser(approvedUser._id.toString(), 'notification', notification);

    return approvedUser;
  }

  private async generateTokens(user: IUser): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      userId: user._id.toString(),
      role: user.role,
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRY as any,
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRY as any,
    });

    await userRepository.addRefreshToken(user._id.toString(), refreshToken);

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
