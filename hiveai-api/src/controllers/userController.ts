import { Response } from 'express';
import { userService } from '../services/UserService';
import { sendSuccess } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';
import { getParam } from '../utils/params';
import { auditLogService } from '../services/AuditLogService';
import { serializeUser } from '../utils/serializers';

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = await userService.getProfile(req.user!.userId);
  sendSuccess(res, serializeUser(user));
};

export const updateMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = await userService.updateProfile(req.user!.userId, req.body);
  sendSuccess(res, serializeUser(user), 'Profile updated');
};

export const listUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { page, limit, role, status, search, sort, order } = req.query as any;
  const result = await userService.listUsers({
    page: parseInt(page) || 1,
    limit: Math.min(parseInt(limit) || 20, 100),
    role,
    status,
    search,
    sort: sort || 'createdAt',
    order: order || 'desc',
  });

  sendSuccess(res, result.users.map(serializeUser), 'Users retrieved', 200, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
};

export const getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = await userService.getProfile(getParam(req.params.id));
  sendSuccess(res, serializeUser(user));
};

export const updateUserStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const targetId = getParam(req.params.id);
  const user = await userService.updateUserStatus(targetId, req.body.status);
  await auditLogService.log({
    userId: req.user!.userId,
    action: 'UPDATE_STATUS',
    resource: 'User',
    resourceId: targetId,
    metadata: { newStatus: req.body.status },
    ipAddress: req.ip || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
  });
  sendSuccess(res, serializeUser(user), 'User status updated');
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const targetId = getParam(req.params.id);
  const user = await userService.updateUserRole(targetId, req.body.role);
  await auditLogService.log({
    userId: req.user!.userId,
    action: 'UPDATE_ROLE',
    resource: 'User',
    resourceId: targetId,
    metadata: { newRole: req.body.role },
    ipAddress: req.ip || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
  });
  sendSuccess(res, serializeUser(user), 'User role updated');
};

export const approveUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const targetId = getParam(req.params.id);
  const user = await userService.approveUser(targetId, req.user!.userId);
  await auditLogService.log({
    userId: req.user!.userId,
    action: 'APPROVE_USER',
    resource: 'User',
    resourceId: targetId,
    metadata: { newStatus: user.status },
    ipAddress: req.ip || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
  });
  sendSuccess(res, serializeUser(user), 'User approved');
};

export const getDashboardStats = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const stats = await userService.getDashboardStats();
  sendSuccess(res, stats);
};

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { page, limit } = req.query as any;
  const result = await auditLogService.getRecent(
    parseInt(page) || 1,
    Math.min(parseInt(limit) || 50, 100)
  );
  sendSuccess(res, result.logs, 'Audit logs retrieved', 200, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
};
