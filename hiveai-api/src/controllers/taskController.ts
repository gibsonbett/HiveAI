import { Response } from 'express';
import { taskService } from '../services/TaskService';
import { sendSuccess } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';
import { getParam } from '../utils/params';
import { serializeTask } from '../utils/serializers';

export const listTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { page, limit, status, projectId, sort, order } = req.query as any;
  const result = await taskService.listTasks(req.user!.userId, req.user!.role, {
    page: parseInt(page) || 1,
    limit: Math.min(parseInt(limit) || 20, 100),
    status,
    projectId,
    sort: sort || 'priority',
    order: order || 'desc',
  });

  sendSuccess(res, result.tasks.map(serializeTask), 'Tasks retrieved', 200, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
};

export const getTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const task = await taskService.getById(getParam(req.params.id));
  sendSuccess(res, serializeTask(task));
};

export const assignTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const task = await taskService.assignTask(getParam(req.params.id), req.user!.userId);
  sendSuccess(res, serializeTask(task), 'Task assigned');
};

export const submitTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const task = await taskService.submitTask(getParam(req.params.id), req.user!.userId, req.body.outputData);
  sendSuccess(res, serializeTask(task), 'Task submitted');
};

export const skipTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const task = await taskService.skipTask(getParam(req.params.id), req.user!.userId);
  sendSuccess(res, serializeTask(task), 'Task skipped');
};

export const getWorkerStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const stats = await taskService.getWorkerStats(req.user!.userId);
  sendSuccess(res, stats);
};

export const getAvailableTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { limit } = req.query as any;
  const result = await taskService.getAvailableTasksForWorker(req.user!.userId, {
    page: 1,
    limit: Math.min(parseInt(limit) || 20, 100),
  });
  sendSuccess(res, result.tasks.map(serializeTask), 'Available tasks retrieved', 200, {
    page: 1,
    limit: result.total,
    total: result.total,
    totalPages: 1,
  });
};
