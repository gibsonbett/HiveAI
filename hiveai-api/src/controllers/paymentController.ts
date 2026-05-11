import { Request, Response } from 'express';
import { walletService } from '../services/WalletService';
import { darajaService } from '../services/DarajaService';
import { transactionRepository } from '../repositories/TransactionRepository';
import { sendSuccess } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';
import { SubscriptionPlan, TransactionStatus, TransactionType } from '../constants';
import { logger } from '../utils/logger';
import { getParam } from '../utils/params';
import { auditLogService } from '../services/AuditLogService';
import { enqueuePaymentRetry } from '../jobs';
import { subscriptionService } from '../services/SubscriptionService';
import { exchangeRateService } from '../services/ExchangeRateService';
import { AppError } from '../middlewares/errorHandler';

export const getWallet = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const wallet = await walletService.getWalletInfo(req.user!.userId);
  sendSuccess(res, wallet);
};

export const getTransactions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { page, limit, type } = req.query as any;
  const result = await walletService.getTransactionHistory(req.user!.userId, {
    page: parseInt(page) || 1,
    limit: Math.min(parseInt(limit) || 20, 100),
    type,
  });

  sendSuccess(res, result.transactions, 'Transactions retrieved', 200, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
};

export const initiateDeposit = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { amount, phoneNumber } = req.body;

  const result = await darajaService.initiateSTKPush({
    phoneNumber,
    amount,
    accountReference: `HiveAI-${req.user!.userId.slice(-6)}`,
    transactionDesc: 'Wallet deposit',
  });

  // Create pending transaction
  const tx = await transactionRepository.create({
    userId: req.user!.userId as any,
    type: 'deposit' as any,
    amount,
    status: TransactionStatus.PENDING,
    description: 'M-Pesa deposit (awaiting confirmation)',
    metadata: {
      checkoutRequestId: result.checkoutRequestId,
      merchantRequestId: result.merchantRequestId,
      phoneNumber,
    },
  });

  // Schedule payment status check in case callback is missed (30s delay)
  enqueuePaymentRetry(tx._id.toString(), 'stk-query', 30000);

  sendSuccess(res, result, 'STK Push initiated. Check your phone.', 200);
};

export const requestWithdrawal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { amountUsd, phoneNumber } = req.body;
  const amountKes = await exchangeRateService.convertUsdToKes(amountUsd);
  const transaction = await walletService.requestWithdrawal(req.user!.userId, amountKes, phoneNumber);
  sendSuccess(res, transaction, 'Withdrawal request submitted', 201);
};

export const getPlans = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const plans = await subscriptionService.getPlanCatalog();
  sendSuccess(res, plans, 'Plans retrieved');
};

export const getSubscription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const subscription = await subscriptionService.getUserSubscription(req.user!.userId);
  sendSuccess(res, subscription, 'Subscription retrieved');
};

export const initiatePlanUpgrade = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { planId, phoneNumber } = req.body as { planId: SubscriptionPlan; phoneNumber: string };
  const plan = subscriptionService.getPlanById(planId);

  if (!plan) {
    throw new AppError('Invalid subscription plan selected', 400);
  }

  const kesPerUsd = await exchangeRateService.getUsdToKesRate();
  const amountKes = Number((plan.priceUsd * kesPerUsd).toFixed(2));

  const result = await darajaService.initiateSTKPush({
    phoneNumber,
    amount: amountKes,
    accountReference: `HiveAI-PLAN-${req.user!.userId.slice(-6)}`,
    transactionDesc: `${plan.name} subscription`,
  });

  const tx = await transactionRepository.create({
    userId: req.user!.userId as any,
    type: TransactionType.SUBSCRIPTION,
    amount: amountKes,
    status: TransactionStatus.PENDING,
    description: `${plan.name} subscription purchase (awaiting confirmation)`,
    metadata: {
      checkoutRequestId: result.checkoutRequestId,
      merchantRequestId: result.merchantRequestId,
      phoneNumber,
      subscription: {
        planId: plan.id,
        durationDays: plan.durationDays,
        priceUsd: plan.priceUsd,
        kesPerUsd,
      },
    },
  });

  enqueuePaymentRetry(tx._id.toString(), 'stk-query', 30000);

  sendSuccess(
    res,
    {
      checkoutRequestId: result.checkoutRequestId,
      amountUsd: plan.priceUsd,
      amountKes,
      kesPerUsd,
    },
    'Upgrade payment initiated. Complete the STK prompt to activate your plan.',
    200
  );
};

export const getPendingWithdrawals = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { page, limit } = req.query as any;
  const result = await walletService.getPendingWithdrawals({
    page: parseInt(page) || 1,
    limit: Math.min(parseInt(limit) || 20, 100),
  });

  sendSuccess(res, result.transactions, 'Pending withdrawals', 200, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    total: result.total,
    totalPages: Math.ceil(result.total / (parseInt(limit) || 20)),
  });
};

export const approveWithdrawal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const txId = getParam(req.params.id);
  const transaction = await walletService.approveWithdrawal(txId);
  await auditLogService.log({
    userId: req.user!.userId,
    action: 'APPROVE_WITHDRAWAL',
    resource: 'Transaction',
    resourceId: txId,
    metadata: { amount: transaction.amount },
    ipAddress: req.ip || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
  });
  sendSuccess(res, transaction, 'Withdrawal approved');
};

export const rejectWithdrawal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const txId = getParam(req.params.id);
  const { reason } = req.body;
  const transaction = await walletService.rejectWithdrawal(txId, reason || 'Rejected by admin');
  await auditLogService.log({
    userId: req.user!.userId,
    action: 'REJECT_WITHDRAWAL',
    resource: 'Transaction',
    resourceId: txId,
    metadata: { reason: reason || 'Rejected by admin' },
    ipAddress: req.ip || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
  });
  sendSuccess(res, transaction, 'Withdrawal rejected');
};

// M-Pesa STK Push callback (no auth — called by Safaricom)
export const mpesaCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = darajaService.parseSTKCallback(req.body);

    logger.info('M-Pesa callback received', {
      checkoutRequestId: parsed.checkoutRequestId,
      success: parsed.success,
    });

    if (parsed.success && parsed.mpesaReceipt && parsed.amount) {
      // Find pending transaction by checkoutRequestId
      const { transactions } = await transactionRepository.findMany(
        {
          status: TransactionStatus.PENDING,
          'metadata.checkoutRequestId': parsed.checkoutRequestId,
        },
        { page: 1, limit: 1 }
      );

      if (transactions.length > 0) {
        const tx = transactions[0];
        const userId = tx.userId.toString();

        await transactionRepository.updateById(tx._id.toString(), {
          status: TransactionStatus.COMPLETED,
          mpesaReceipt: parsed.mpesaReceipt,
          metadata: { ...tx.metadata, ...parsed },
        });

        if (tx.type === TransactionType.SUBSCRIPTION) {
          const subscriptionMeta = (tx.metadata as any)?.subscription;
          if (subscriptionMeta?.planId && subscriptionMeta?.durationDays) {
            await subscriptionService.activatePlan(userId, subscriptionMeta.planId, subscriptionMeta.durationDays);
          }
          logger.info('Subscription purchase completed', {
            userId,
            planId: subscriptionMeta?.planId,
            amount: parsed.amount,
            receipt: parsed.mpesaReceipt,
          });
        } else {
          // Credit wallet for normal deposits.
          const { User } = await import('../models/User');
          await User.findByIdAndUpdate(userId, {
            $inc: { walletBalance: parsed.amount },
          }).exec();

          const { emitToUser } = await import('../sockets');
          emitToUser(userId, 'wallet:updated', { type: 'deposit', amount: parsed.amount });

          logger.info('Deposit completed', { userId, amount: parsed.amount, receipt: parsed.mpesaReceipt });
        }
      }
    } else {
      // Payment failed or cancelled
      const { transactions } = await transactionRepository.findMany(
        {
          status: TransactionStatus.PENDING,
          'metadata.checkoutRequestId': parsed.checkoutRequestId,
        },
        { page: 1, limit: 1 }
      );

      if (transactions.length > 0) {
        await transactionRepository.updateById(transactions[0]._id.toString(), {
          status: TransactionStatus.FAILED,
        });
      }
    }
  } catch (error) {
    logger.error('M-Pesa callback processing error', { error });
  }

  // Always respond with success to Safaricom
  res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
};
