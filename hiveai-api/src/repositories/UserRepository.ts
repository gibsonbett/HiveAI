import { User } from '../models/User';
import { IUser } from '../types';
import { UserRole, UserStatus } from '../constants';

export class UserRepository {
  async create(data: Partial<IUser>): Promise<IUser> {
    return User.create(data);
  }

  async findById(id: string, includeSecrets = false): Promise<IUser | null> {
    const query = User.findById(id);
    if (includeSecrets) {
      query.select('+passwordHash +refreshTokens +emailVerifyToken +emailVerifyExpiry +approvalToken +approvalTokenExpiry +passwordResetToken +passwordResetExpiry');
    }
    return query.exec();
  }

  async findByEmail(email: string, includeSecrets = false): Promise<IUser | null> {
    const query = User.findOne({ email });
    if (includeSecrets) {
      query.select('+passwordHash +refreshTokens +emailVerifyToken +emailVerifyExpiry +approvalToken +approvalTokenExpiry +passwordResetToken +passwordResetExpiry');
    }
    return query.exec();
  }

  async findMany(
    filter: Record<string, unknown>,
    options: { page: number; limit: number; sort: string; order: 'asc' | 'desc' }
  ): Promise<{ users: IUser[]; total: number }> {
    const { page, limit, sort, order } = options;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ [sort]: order === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      User.countDocuments(filter).exec(),
    ]);

    return { users, total };
  }

  async updateById(id: string, update: Record<string, unknown>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async findByResetToken(token: string): Promise<IUser | null> {
    return User.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: new Date() },
    }).select('+passwordHash +passwordResetToken +passwordResetExpiry').exec();
  }

  async findByVerifyToken(token: string): Promise<IUser | null> {
    return User.findOne({
      emailVerifyToken: token,
      emailVerifyExpiry: { $gt: new Date() },
    }).select('+emailVerifyToken +emailVerifyExpiry').exec();
  }

  async findByApprovalToken(token: string): Promise<IUser | null> {
    return User.findOne({
      approvalToken: token,
      approvalTokenExpiry: { $gt: new Date() },
    })
      .select('+approvalToken +approvalTokenExpiry')
      .exec();
  }

  async findActiveAdmins(): Promise<IUser[]> {
    return User.find({ role: UserRole.ADMIN, status: UserStatus.ACTIVE }).exec();
  }

  async addRefreshToken(userId: string, token: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $push: { refreshTokens: token },
    }).exec();
  }

  async removeRefreshToken(userId: string, token: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: token },
    }).exec();
  }

  async clearRefreshTokens(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $set: { refreshTokens: [] },
    }).exec();
  }

  async countByRole(): Promise<Record<string, number>> {
    const results = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]).exec();
    return results.reduce((acc: Record<string, number>, r: { _id: string; count: number }) => {
      acc[r._id] = r.count;
      return acc;
    }, {});
  }
}

export const userRepository = new UserRepository();
