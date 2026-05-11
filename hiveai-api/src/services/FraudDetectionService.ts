import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
import { ITask } from '../models/Task';
import { NotificationType, TransactionStatus, TransactionType, UserRole, UserStatus } from '../constants';
import { notificationService } from './NotificationService';
import { emitToRole } from '../sockets';
import { logger } from '../utils/logger';
import { redis } from '../config/redis';

type RiskLevel = 'low' | 'medium' | 'high';
type RiskAction = 'withdrawal' | 'task_submission';

const TRUST_SCORE_PENALTY: Record<RiskLevel, number> = {
  low: 0,
  medium: 4,
  high: 12,
};

const THROTTLE_SECONDS: Record<RiskAction, number> = {
  withdrawal: 60 * 30,
  task_submission: 60 * 5,
};

class FraudDetectionService {
  private getThrottleKey(userId: string, action: RiskAction) {
    return `fraud:throttle:${action}:${userId}`;
  }

  async getThrottleRemainingSeconds(userId: string, action: RiskAction): Promise<number> {
    try {
      const ttl = await redis.ttl(this.getThrottleKey(userId, action));
      return ttl > 0 ? ttl : 0;
    } catch {
      return 0;
    }
  }

  async applyRiskConsequences(
    userId: string,
    action: RiskAction,
    level: RiskLevel,
    flags: string[]
  ): Promise<{ trustScore: number | null; throttledUntil: string | null }> {
    if (level === 'low') return { trustScore: null, throttledUntil: null };

    const penalty = TRUST_SCORE_PENALTY[level];
    const user = await User.findById(userId).select('trustScore').lean();
    if (!user) return { trustScore: null, throttledUntil: null };

    const nextTrustScore = Math.max(0, Math.round((user.trustScore || 0) - penalty));
    await User.findByIdAndUpdate(userId, { trustScore: nextTrustScore }).exec();

    let throttledUntil: string | null = null;
    const shouldThrottle = level === 'high' || nextTrustScore <= 45;
    if (shouldThrottle) {
      const duration = level === 'high' ? THROTTLE_SECONDS[action] : Math.round(THROTTLE_SECONDS[action] / 2);
      try {
        await redis.set(this.getThrottleKey(userId, action), JSON.stringify({ level, flags }), 'EX', duration);
        throttledUntil = new Date(Date.now() + duration * 1000).toISOString();
      } catch {
        throttledUntil = null;
      }
    }

    return { trustScore: nextTrustScore, throttledUntil };
  }

  async assessWithdrawalRisk(userId: string, amount: number): Promise<{ level: RiskLevel; flags: string[] }> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const [recentWithdrawals, user] = await Promise.all([
      Transaction.find({
        userId,
        type: TransactionType.WITHDRAWAL,
        status: { $in: [TransactionStatus.PENDING, TransactionStatus.COMPLETED] },
        createdAt: { $gte: oneDayAgo },
      })
        .sort({ createdAt: -1 })
        .select('amount createdAt')
        .lean(),
      User.findById(userId).select('createdAt').lean(),
    ]);

    const flags: string[] = [];
    const dailyCount = recentWithdrawals.length;
    const dailyAmount = recentWithdrawals.reduce((sum, tx) => sum + Number(tx.amount || 0), 0) + amount;
    const lastWithdrawalAt = recentWithdrawals[0]?.createdAt;

    if (dailyCount >= 5) flags.push('withdrawal_velocity_high');
    if (dailyAmount > 50000) flags.push('daily_withdrawal_amount_high');
    if (lastWithdrawalAt && new Date(lastWithdrawalAt) >= fiveMinutesAgo) flags.push('cooldown_violation');

    if (user?.createdAt) {
      const accountAgeHours = (now.getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60);
      if (accountAgeHours < 24 && amount >= 10000) {
        flags.push('new_account_large_withdrawal');
      }
    }

    const level: RiskLevel =
      flags.includes('cooldown_violation') || flags.includes('new_account_large_withdrawal')
        ? 'high'
        : flags.length > 0
          ? 'medium'
          : 'low';

    return { level, flags };
  }

  assessTaskSubmissionRisk(task: ITask, outputData: Record<string, unknown>): { level: RiskLevel; flags: string[] } {
    const flags: string[] = [];

    if (task.startedAt) {
      const secondsSpent = (Date.now() - new Date(task.startedAt).getTime()) / 1000;
      if (secondsSpent < 15) flags.push('submission_too_fast');
    }

    if (!outputData || Object.keys(outputData).length === 0) {
      flags.push('empty_output_data');
    }

    const level: RiskLevel =
      flags.includes('submission_too_fast') && flags.includes('empty_output_data')
        ? 'high'
        : flags.length > 0
          ? 'medium'
          : 'low';

    return { level, flags };
  }

  async alertAdmins(title: string, message: string, metadata: Record<string, unknown>) {
    logger.warn(`${title}: ${message}`, metadata);

    const admins = await User.find({ role: UserRole.ADMIN, status: UserStatus.ACTIVE })
      .select('_id')
      .lean();

    await Promise.all(
      admins.map((admin) =>
        notificationService.create({
          userId: admin._id.toString(),
          type: NotificationType.SYSTEM,
          title,
          message,
          metadata: { ...metadata, category: 'fraud' },
        })
      )
    );

    emitToRole(UserRole.ADMIN, 'fraud:alert', { title, message, metadata });
  }
}

export const fraudDetectionService = new FraudDetectionService();
