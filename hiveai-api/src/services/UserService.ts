import { userRepository } from '../repositories/UserRepository';
import { AppError } from '../middlewares/errorHandler';
import { IUser } from '../types';
import { NotificationType, UserRole, UserStatus } from '../constants';
import { enqueueEmail } from '../jobs';
import { notificationService } from './NotificationService';
import { emitToUser } from '../sockets';

class UserService {
  async getProfile(userId: string): Promise<IUser> {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string; phone?: string; skills?: string[] }
  ): Promise<IUser> {
    const user = await userRepository.updateById(userId, data);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async listUsers(options: {
    page: number;
    limit: number;
    role?: UserRole;
    status?: UserStatus;
    search?: string;
    sort: string;
    order: 'asc' | 'desc';
  }): Promise<{ users: IUser[]; total: number; page: number; limit: number; totalPages: number }> {
    const filter: Record<string, unknown> = {};

    if (options.role) filter.role = options.role;
    if (options.status) filter.status = options.status;
    if (options.search) {
      filter.$or = [
        { firstName: { $regex: options.search, $options: 'i' } },
        { lastName: { $regex: options.search, $options: 'i' } },
        { email: { $regex: options.search, $options: 'i' } },
      ];
    }

    const { users, total } = await userRepository.findMany(filter, {
      page: options.page,
      limit: options.limit,
      sort: options.sort,
      order: options.order,
    });

    return {
      users,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<IUser> {
    const user = await userRepository.updateById(userId, { status });
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async updateUserRole(userId: string, role: UserRole): Promise<IUser> {
    const user = await userRepository.updateById(userId, { role });
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async approveUser(userId: string, approvedByUserId: string): Promise<IUser> {
    const existing = await userRepository.findById(userId);
    if (!existing) throw new AppError('User not found', 404);

    if (existing.status !== UserStatus.PENDING) {
      throw new AppError('Only pending users can be approved', 400);
    }

    const user = await userRepository.updateById(userId, {
      status: UserStatus.ACTIVE,
      approvalToken: undefined,
      approvalTokenExpiry: undefined,
      approvedAt: new Date(),
      approvedBy: approvedByUserId,
    });

    if (!user) throw new AppError('User not found', 404);

    await enqueueEmail({
      type: 'signup-approved',
      to: user.email,
      firstName: user.firstName,
    });

    const notification = await notificationService.create({
      userId: user._id.toString(),
      type: NotificationType.SYSTEM,
      title: 'Account approved',
      message: 'Your account has been approved. You can now log in.',
      metadata: { category: 'user_approval', status: 'approved' },
    });
    emitToUser(user._id.toString(), 'notification', notification);

    return user;
  }

  async getDashboardStats(): Promise<Record<string, unknown>> {
    const roleCounts = await userRepository.countByRole();
    return {
      totalUsers: Object.values(roleCounts).reduce((a, b) => a + b, 0),
      roleCounts,
    };
  }
}

export const userService = new UserService();
