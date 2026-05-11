import { reviewRepository } from '../repositories/ReviewRepository';
import { taskRepository } from '../repositories/TaskRepository';
import { userRepository } from '../repositories/UserRepository';
import { projectRepository } from '../repositories/ProjectRepository';
import { notificationService } from './NotificationService';
import { walletService } from './WalletService';
import { AppError } from '../middlewares/errorHandler';
import { TaskStatus, ReviewDecision, NotificationType, UserRole } from '../constants';
import { Task } from '../models/Task';
import { emitToUser } from '../sockets';
import { invalidateAnalyticsCache } from '../utils/cache';
import { subscriptionService } from './SubscriptionService';

class ReviewService {
  async getReviewQueue(options: { page: number; limit: number }) {
    const filter = { status: TaskStatus.SUBMITTED };
    const { tasks, total } = await taskRepository.findMany(filter, {
      page: options.page,
      limit: options.limit,
      sort: 'submittedAt',
      order: 'asc',
    });

    return {
      tasks,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  async submitReview(
    reviewerId: string,
    data: { taskId: string; decision: ReviewDecision; comments?: string; score: number }
  ) {
    await subscriptionService.assertCanWorkOnItem(reviewerId, UserRole.REVIEWER);

    const task = await taskRepository.findById(data.taskId);
    if (!task) throw new AppError('Task not found', 404);

    if (task.status !== TaskStatus.SUBMITTED) {
      throw new AppError('Task is not ready for review', 400);
    }

    const review = await reviewRepository.create({
      taskId: data.taskId as any,
      reviewerId: reviewerId as any,
      decision: data.decision,
      comments: data.comments,
      score: data.score,
    });

    let newTaskStatus: TaskStatus;
    switch (data.decision) {
      case ReviewDecision.APPROVED:
        newTaskStatus = TaskStatus.APPROVED;
        break;
      case ReviewDecision.REJECTED:
        newTaskStatus = TaskStatus.REJECTED;
        break;
      case ReviewDecision.NEEDS_REVISION:
        newTaskStatus = TaskStatus.IN_PROGRESS;
        break;
      default:
        newTaskStatus = TaskStatus.UNDER_REVIEW;
    }

    await taskRepository.updateById(data.taskId, {
      status: newTaskStatus,
      qualityScore: data.score,
      reviewStatus: data.decision,
    });

    // Update worker accuracy score
    if (task.assignedTo) {
      const workerId = task.assignedTo.toString();
      const worker = await userRepository.findById(workerId);
      if (worker) {
        const newAccuracy = Math.round(
          worker.accuracyScore * 0.9 + data.score * 0.1
        );
        await userRepository.updateById(workerId, { accuracyScore: newAccuracy });
      }
    }

    // Increment project completed tasks for approvals
    if (data.decision === ReviewDecision.APPROVED && task.projectId) {
      await projectRepository.incrementCompletedTasks(task.projectId.toString());

      // Credit earnings to worker wallet
      if (task.assignedTo && task.payoutAmount > 0) {
        await walletService.creditEarning(
          task.assignedTo.toString(),
          task.payoutAmount,
          data.taskId
        );
      }
    }

    // Notify the worker about the review result
    if (task.assignedTo) {
      const workerId = task.assignedTo.toString();
      const notifType =
        data.decision === ReviewDecision.APPROVED
          ? NotificationType.TASK_APPROVED
          : data.decision === ReviewDecision.REJECTED
            ? NotificationType.TASK_REJECTED
            : NotificationType.SYSTEM;

      const notifTitle =
        data.decision === ReviewDecision.APPROVED
          ? 'Task Approved'
          : data.decision === ReviewDecision.REJECTED
            ? 'Task Rejected'
            : 'Task Needs Revision';

      const notifMessage =
        data.decision === ReviewDecision.APPROVED
          ? `Your task has been approved with a score of ${data.score}.`
          : data.decision === ReviewDecision.REJECTED
            ? `Your task has been rejected. ${data.comments || ''}`
            : `Your task needs revision. ${data.comments || ''}`;

      await notificationService.create({
        userId: workerId,
        type: notifType,
        title: notifTitle,
        message: notifMessage,
        metadata: { taskId: data.taskId, score: data.score, decision: data.decision },
      });

      emitToUser(workerId, 'task:reviewed', {
        taskId: data.taskId,
        decision: data.decision,
        score: data.score,
      });
    }

    await invalidateAnalyticsCache();
    await subscriptionService.consumeTrialUsage(reviewerId);

    return review;
  }

  async getTaskReviews(taskId: string) {
    return reviewRepository.findByTaskId(taskId);
  }

  async getReviewerStats(reviewerId: string) {
    const stats = await reviewRepository.getReviewerStats(reviewerId);

    // Get pending queue count
    const pendingCount = await Task.countDocuments({ status: TaskStatus.SUBMITTED }).exec();

    return {
      ...stats,
      pending: pendingCount,
      reviewed: stats.total,
    };
  }
}

export const reviewService = new ReviewService();
