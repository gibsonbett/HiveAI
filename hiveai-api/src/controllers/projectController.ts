import { Response } from 'express';
import { projectService } from '../services/ProjectService';
import { sendSuccess } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';
import { UserRole } from '../constants';
import { getParam } from '../utils/params';
import { serializeProject } from '../utils/serializers';

export const getProjectStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const stats = await projectService.getStats(req.user!.userId, req.user!.role);
  sendSuccess(res, stats);
};

export const createProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const project = await projectService.create(req.user!.userId, req.body);
  sendSuccess(res, serializeProject(project), 'Project created', 201);
};

export const listProjects = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { page, limit, status, taskType, sort, order } = req.query as any;
  const result = await projectService.list(req.user!.userId, req.user!.role, {
    page: parseInt(page) || 1,
    limit: Math.min(parseInt(limit) || 20, 100),
    status,
    taskType,
    sort: sort || 'createdAt',
    order: order || 'desc',
  });

  sendSuccess(res, result.projects.map(serializeProject), 'Projects retrieved', 200, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
};

export const getProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const project = await projectService.getById(getParam(req.params.id), req.user!.userId, req.user!.role);
  sendSuccess(res, serializeProject(project));
};

export const updateProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const project = await projectService.update(getParam(req.params.id), req.user!.userId, req.user!.role, req.body);
  sendSuccess(res, serializeProject(project), 'Project updated');
};

export const generateTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const count = await projectService.generateTasks(
    getParam(req.params.id),
    req.user!.userId,
    req.user!.role,
    req.body.tasks
  );
  sendSuccess(res, { tasksGenerated: count }, `${count} tasks generated`, 201);
};
