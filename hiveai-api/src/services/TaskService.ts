import { taskRepository } from '../repositories/TaskRepository';
import { projectRepository } from '../repositories/ProjectRepository';
import { notificationService } from './NotificationService';
import { AppError } from '../middlewares/errorHandler';
import { TaskStatus, UserRole, NotificationType } from '../constants';
import { Task } from '../models/Task';
import { emitToUser, emitToRole } from '../sockets';
import mongoose from 'mongoose';
import { fraudDetectionService } from './FraudDetectionService';
import { subscriptionService } from './SubscriptionService';

class TaskService {
  async getAvailableTasks(options: { page: number; limit: number }) {
    return taskRepository.findAvailableForWorker('', options);
  }

  async listTasks(
    userId: string,
    role: UserRole,
    options: {
      page: number;
      limit: number;
      status?: string;
      projectId?: string;
      sort: string;
      order: 'asc' | 'desc';
    }
  ) {
    const filter: Record<string, unknown> = {};

    if (role === UserRole.WORKER) {
      if (options.status === TaskStatus.PENDING) {
        filter.status = TaskStatus.PENDING;
        filter.assignedTo = { $exists: false };
      } else {
        filter.assignedTo = userId;
        if (options.status) filter.status = options.status;
      }
    } else {
      if (options.status) filter.status = options.status;
      if (options.projectId) filter.projectId = options.projectId;
    }

    const { tasks, total } = await taskRepository.findMany(filter, {
      page: options.page,
      limit: options.limit,
      sort: options.sort,
      order: options.order,
    });

    return {
      tasks,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  async getById(taskId: string) {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new AppError('Task not found', 404);
    return task;
  }

  async assignTask(taskId: string, workerId: string) {
    await subscriptionService.assertCanWorkOnItem(workerId, UserRole.WORKER);

    const task = await taskRepository.findById(taskId);
    if (!task) throw new AppError('Task not found', 404);

    if (task.status !== TaskStatus.PENDING) {
      throw new AppError('Task is not available for assignment', 400);
    }

    const updated = await taskRepository.updateById(taskId, {
      assignedTo: workerId,
      status: TaskStatus.ASSIGNED,
      startedAt: new Date(),
    });

    // Notify worker
    await notificationService.create({
      userId: workerId,
      type: NotificationType.TASK_ASSIGNED,
      title: 'Task Assigned',
      message: 'A new task has been assigned to you.',
      metadata: { taskId },
    });

    await subscriptionService.consumeTrialUsage(workerId);

    emitToUser(workerId, 'task:assigned', { taskId });

    return updated;
  }

  async submitTask(taskId: string, workerId: string, outputData: Record<string, unknown>) {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new AppError('Task not found', 404);

    if (task.assignedTo?.toString() !== workerId) {
      throw new AppError('You are not assigned to this task', 403);
    }

    if (task.status !== TaskStatus.ASSIGNED && task.status !== TaskStatus.IN_PROGRESS) {
      throw new AppError('Task cannot be submitted in current state', 400);
    }

    const risk = fraudDetectionService.assessTaskSubmissionRisk(task, outputData);
    if (risk.level !== 'low') {
      const consequence = await fraudDetectionService.applyRiskConsequences(workerId, 'task_submission', risk.level, risk.flags);
      await fraudDetectionService.alertAdmins(
        'Suspicious Task Submission',
        `Task ${taskId} by worker ${workerId} was flagged as ${risk.level} risk.`,
        {
          taskId,
          workerId,
          flags: risk.flags,
          trustScore: consequence.trustScore,
          throttledUntil: consequence.throttledUntil,
        }
      );
    }

    const submitted = await taskRepository.updateById(taskId, {
      outputData,
      status: TaskStatus.SUBMITTED,
      submittedAt: new Date(),
    });

    // Notify reviewers that a task is ready for review
    emitToRole('reviewer', 'review:needed', { taskId });

    return submitted;
  }

  async skipTask(taskId: string, workerId: string) {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new AppError('Task not found', 404);

    if (task.assignedTo?.toString() !== workerId) {
      throw new AppError('You are not assigned to this task', 403);
    }

    return taskRepository.updateById(taskId, {
      assignedTo: undefined,
      status: TaskStatus.PENDING,
      startedAt: undefined,
    });
  }

  async getWorkerStats(workerId: string) {
    const results = await Task.aggregate([
      { $match: { assignedTo: new mongoose.Types.ObjectId(workerId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          earnings: { $sum: '$payoutAmount' },
        },
      },
    ]).exec();

    let totalAssigned = 0;
    let totalCompleted = 0;
    let earnings = 0;

    results.forEach((r: { _id: string; count: number; earnings: number }) => {
      totalAssigned += r.count;
      if (r._id === TaskStatus.APPROVED) {
        totalCompleted += r.count;
        earnings += r.earnings;
      }
    });

    // Get available tasks count
    const available = await Task.countDocuments({
      status: TaskStatus.PENDING,
      assignedTo: { $exists: false },
    }).exec();

    return { totalAssigned, totalCompleted: totalCompleted, completed: totalCompleted, available, earnings };
  }

  async getAvailableTasksForWorker(workerId: string, options: { page: number; limit: number }) {
    return taskRepository.findAvailableForWorker(workerId, options);
  }
}

export const taskService = new TaskService();
