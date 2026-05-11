import { Queue, Worker, Job } from 'bullmq';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';
import { emailService } from '../services/EmailService';

// --- Queue Definitions ---
export const emailQueue = new Queue('email', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

export const paymentRetryQueue = new Queue('payment-retry', {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 50,
    removeOnFail: 100,
  },
});

// --- Email Worker ---
const emailWorker = new Worker(
  'email',
  async (job: Job) => {
    const { type, to, firstName, token, amount, projectTitle, adminFirstName, applicant, userId } = job.data;

    switch (type) {
      case 'verification':
        await emailService.sendVerificationEmail(to, firstName, token);
        break;
      case 'password-reset':
        await emailService.sendPasswordResetEmail(to, firstName, token);
        break;
      case 'task-assigned':
        await emailService.sendTaskAssignedEmail(to, firstName, projectTitle);
        break;
      case 'withdrawal-approved':
        await emailService.sendWithdrawalApprovedEmail(to, firstName, amount);
        break;
      case 'signup-approval-request':
        await emailService.sendSignupApprovalRequestEmail(to, adminFirstName || firstName, applicant, token, userId);
        break;
      case 'signup-approved':
        await emailService.sendSignupApprovedEmail(to, firstName);
        break;
      default:
        logger.warn(`Unknown email job type: ${type}`);
    }
  },
  { connection: redis, concurrency: 5 }
);

emailWorker.on('completed', (job) => {
  logger.info(`Email job ${job.id} completed: ${job.data.type} to ${job.data.to}`);
});

emailWorker.on('failed', (job, err) => {
  logger.error(`Email job ${job?.id} failed: ${err.message}`);
});

// --- Payment Retry Worker ---
const paymentRetryWorker = new Worker(
  'payment-retry',
  async (job: Job) => {
    const { transactionId, type } = job.data;
    logger.info(`Payment retry job: ${type} for transaction ${transactionId}`);

    if (type === 'stk-query') {
      const { darajaService } = await import('../services/DarajaService');
      const { transactionRepository } = await import('../repositories/TransactionRepository');
      const { TransactionStatus, TransactionType } = await import('../constants');

      const tx = await transactionRepository.findById(transactionId);
      if (!tx || tx.status !== TransactionStatus.PENDING) return;

      const checkoutId = (tx.metadata as any)?.checkoutRequestId;
      if (!checkoutId) return;

      const result = await darajaService.querySTKStatus(checkoutId);
      if (result.resultCode === '0') {
        // Payment succeeded
        await transactionRepository.updateById(transactionId, {
          status: TransactionStatus.COMPLETED,
        });

        if (tx.type === TransactionType.SUBSCRIPTION) {
          const subscriptionMeta = (tx.metadata as any)?.subscription;
          if (subscriptionMeta?.planId && subscriptionMeta?.durationDays) {
            const { subscriptionService } = await import('../services/SubscriptionService');
            await subscriptionService.activatePlan(
              tx.userId.toString(),
              subscriptionMeta.planId,
              subscriptionMeta.durationDays
            );
          }
        } else {
          const { User } = await import('../models/User');
          await User.findByIdAndUpdate(tx.userId, {
            $inc: { walletBalance: tx.amount },
          }).exec();
        }

        logger.info(`Payment retry succeeded for ${transactionId}`);
      } else if (result.resultCode !== '1032') {
        // Not cancelled by user - mark as failed
        await transactionRepository.updateById(transactionId, {
          status: TransactionStatus.FAILED,
          metadata: { ...(tx.metadata as any), failReason: result.resultDesc },
        });
      }
      // If 1032 (cancelled) and still within retry window, let it retry
    }
  },
  { connection: redis, concurrency: 2 }
);

paymentRetryWorker.on('completed', (job) => {
  logger.info(`Payment retry job ${job.id} completed`);
});

paymentRetryWorker.on('failed', (job, err) => {
  logger.error(`Payment retry job ${job?.id} failed: ${err.message}`);
});

// --- Helper to enqueue ---
export const enqueueEmail = async (data: {
  type: string;
  to: string;
  firstName: string;
  token?: string;
  amount?: number;
  projectTitle?: string;
  adminFirstName?: string;
  applicant?: { firstName: string; lastName: string; role: string; email: string };
  userId?: string;
}) => {
  const jobId = [
    'email',
    data.type,
    data.to,
    data.token || '',
    data.projectTitle || '',
    data.amount?.toString() || '',
  ]
    .join('|')
    .replace(/[:\s]/g, '_');

  await emailQueue.add(`email:${data.type}`, data, { jobId });
};

export const enqueuePaymentRetry = async (transactionId: string, type = 'stk-query', delay = 30000) => {
  const jobId = `retry|${transactionId}|${type}`.replace(/[:\s]/g, '_');
  await paymentRetryQueue.add(`retry:${transactionId}`, { transactionId, type }, { delay, jobId });
};

export const initializeQueues = () => {
  logger.info('BullMQ queues initialized (email, payment-retry)');
};
