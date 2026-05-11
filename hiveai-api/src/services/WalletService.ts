import { transactionRepository } from '../repositories/TransactionRepository';
import { userRepository } from '../repositories/UserRepository';
import { notificationService } from './NotificationService';
import { darajaService } from './DarajaService';
import { emailService } from './EmailService';
import { AppError } from '../middlewares/errorHandler';
import { TransactionType, TransactionStatus, NotificationType } from '../constants';
import { emitToUser } from '../sockets';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { fraudDetectionService } from './FraudDetectionService';
import { invalidateAnalyticsCache } from '../utils/cache';
import { subscriptionService } from './SubscriptionService';

const MINIMUM_WITHDRAWAL = 100; // KES

class WalletService {
  async getWalletInfo(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    return {
      walletBalance: user.walletBalance,
      pendingBalance: user.pendingBalance,
    };
  }

  async getTransactionHistory(
    userId: string,
    options: { page: number; limit: number; type?: string }
  ) {
    const filter: Record<string, unknown> = { userId };
    if (options.type) filter.type = options.type;

    const { transactions, total } = await transactionRepository.findMany(filter, {
      page: options.page,
      limit: options.limit,
    });

    return {
      transactions,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  async creditEarning(userId: string, amount: number, taskId: string) {
    const transaction = await transactionRepository.create({
      userId: userId as any,
      type: TransactionType.EARNING,
      amount,
      status: TransactionStatus.COMPLETED,
      description: `Task earnings`,
      metadata: { taskId },
    });

    await User.findByIdAndUpdate(userId, {
      $inc: { walletBalance: amount },
    }).exec();

    await notificationService.create({
      userId,
      type: NotificationType.PAYMENT_COMPLETED,
      title: 'Earnings Received',
      message: `KES ${amount.toFixed(2)} added to your wallet for completed task.`,
      metadata: { transactionId: transaction._id.toString(), taskId },
    });

    emitToUser(userId, 'wallet:updated', { walletBalance: amount });

    return transaction;
  }

  async requestWithdrawal(userId: string, amount: number, phoneNumber: string) {
    if (amount < MINIMUM_WITHDRAWAL) {
      throw new AppError(`Minimum withdrawal is KES ${MINIMUM_WITHDRAWAL}`, 400);
    }

    await subscriptionService.assertCanWithdraw(userId);

    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const throttleRemaining = await fraudDetectionService.getThrottleRemainingSeconds(userId, 'withdrawal');
    if (throttleRemaining > 0) {
      const minutes = Math.ceil(throttleRemaining / 60);
      throw new AppError(`Withdrawals are temporarily restricted. Try again in ${minutes} minute(s).`, 429);
    }

    if (user.walletBalance < amount) {
      throw new AppError('Insufficient wallet balance', 400);
    }

    const risk = await fraudDetectionService.assessWithdrawalRisk(userId, amount);
    const consequence = await fraudDetectionService.applyRiskConsequences(userId, 'withdrawal', risk.level, risk.flags);

    if (risk.level === 'high') {
      await fraudDetectionService.alertAdmins(
        'High-Risk Withdrawal Blocked',
        `Blocked withdrawal request for user ${userId}.`,
        {
          userId,
          amount,
          flags: risk.flags,
          trustScore: consequence.trustScore,
          throttledUntil: consequence.throttledUntil,
        }
      );
      throw new AppError('Withdrawal temporarily blocked for security review', 403);
    }

    if (risk.level === 'medium') {
      await fraudDetectionService.alertAdmins(
        'Medium-Risk Withdrawal Flagged',
        `Withdrawal request flagged for additional review for user ${userId}.`,
        {
          userId,
          amount,
          flags: risk.flags,
          trustScore: consequence.trustScore,
          throttledUntil: consequence.throttledUntil,
        }
      );
    }

    // Move from wallet to pending
    await User.findByIdAndUpdate(userId, {
      $inc: { walletBalance: -amount, pendingBalance: amount },
    }).exec();

    const transaction = await transactionRepository.create({
      userId: userId as any,
      type: TransactionType.WITHDRAWAL,
      amount,
      status: TransactionStatus.PENDING,
      description: `Withdrawal to ${phoneNumber}`,
      metadata: {
        phoneNumber,
        riskLevel: risk.level,
        riskFlags: risk.flags,
        trustScoreAfterRisk: consequence.trustScore,
        throttledUntil: consequence.throttledUntil,
      },
    });

    return transaction;
  }

  async approveWithdrawal(transactionId: string) {
    const transaction = await transactionRepository.findById(transactionId);
    if (!transaction) throw new AppError('Transaction not found', 404);

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new AppError('Transaction is not pending', 400);
    }

    // Update transaction status - actual M-Pesa B2C will be triggered by DarajaService
    await transactionRepository.updateById(transactionId, {
      status: TransactionStatus.COMPLETED,
    });

    const userId = transaction.userId.toString();

    // Deduct from pending
    await User.findByIdAndUpdate(userId, {
      $inc: { pendingBalance: -transaction.amount },
    }).exec();

    // Initiate M-Pesa B2C payout
    const phoneNumber = (transaction.metadata as any)?.phoneNumber;
    if (phoneNumber) {
      try {
        const b2cResult = await darajaService.initiateB2C({
          phoneNumber,
          amount: transaction.amount,
          remarks: `HiveAI withdrawal ${transactionId}`,
          occasion: 'Earnings withdrawal',
        });
        await transactionRepository.updateById(transactionId, {
          metadata: { ...(transaction.metadata as any), b2c: b2cResult },
        });
      } catch (error) {
        logger.error('B2C payout failed, transaction still marked completed', { transactionId, error });
      }
    }

    // Send email notification
    const user = await userRepository.findById(userId);
    if (user) {
      await emailService.sendWithdrawalApprovedEmail(user.email, user.firstName, transaction.amount);
    }

    await notificationService.create({
      userId,
      type: NotificationType.WITHDRAWAL_APPROVED,
      title: 'Withdrawal Approved',
      message: `Your withdrawal of KES ${transaction.amount.toFixed(2)} has been approved.`,
      metadata: { transactionId },
    });

    emitToUser(userId, 'wallet:updated', { type: 'withdrawal_approved' });
    await invalidateAnalyticsCache();

    return transaction;
  }

  async rejectWithdrawal(transactionId: string, reason: string) {
    const transaction = await transactionRepository.findById(transactionId);
    if (!transaction) throw new AppError('Transaction not found', 404);

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new AppError('Transaction is not pending', 400);
    }

    await transactionRepository.updateById(transactionId, {
      status: TransactionStatus.FAILED,
      metadata: { ...transaction.metadata, rejectionReason: reason },
    });

    const userId = transaction.userId.toString();

    // Refund back to wallet from pending
    await User.findByIdAndUpdate(userId, {
      $inc: { walletBalance: transaction.amount, pendingBalance: -transaction.amount },
    }).exec();

    emitToUser(userId, 'wallet:updated', { type: 'withdrawal_rejected' });

    return transaction;
  }

  async processDeposit(userId: string, amount: number, mpesaReceipt: string) {
    // Check for duplicate
    const existing = await transactionRepository.findByMpesaReceipt(mpesaReceipt);
    if (existing) throw new AppError('Duplicate transaction', 400);

    const transaction = await transactionRepository.create({
      userId: userId as any,
      type: TransactionType.DEPOSIT,
      amount,
      mpesaReceipt,
      status: TransactionStatus.COMPLETED,
      description: `M-Pesa deposit`,
    });

    await User.findByIdAndUpdate(userId, {
      $inc: { walletBalance: amount },
    }).exec();

    emitToUser(userId, 'wallet:updated', { walletBalance: amount });

    return transaction;
  }

  async getPendingWithdrawals(options: { page: number; limit: number }) {
    return transactionRepository.findMany(
      { type: TransactionType.WITHDRAWAL, status: TransactionStatus.PENDING },
      options
    );
  }
}

export const walletService = new WalletService();
