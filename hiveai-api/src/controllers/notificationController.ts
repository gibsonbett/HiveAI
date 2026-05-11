import { Response } from 'express';
import { notificationService } from '../services/NotificationService';
import { sendSuccess } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';
import { getParam } from '../utils/params';

export const getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { page, limit } = req.query as any;
  const result = await notificationService.getUserNotifications(req.user!.userId, {
    page: parseInt(page) || 1,
    limit: Math.min(parseInt(limit) || 20, 100),
  });

  sendSuccess(res, result.notifications, 'Notifications retrieved', 200, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
};

export const getFraudAlerts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { page, limit } = req.query as any;
  const result = await notificationService.getFraudAlertsForAdmin(req.user!.userId, {
    page: parseInt(page) || 1,
    limit: Math.min(parseInt(limit) || 20, 100),
  });

  sendSuccess(res, result.alerts, 'Fraud alerts retrieved', 200, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  await notificationService.markAsRead(getParam(req.params.id), req.user!.userId);
  sendSuccess(res, null, 'Notification marked as read');
};

export const markAllAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  await notificationService.markAllAsRead(req.user!.userId);
  sendSuccess(res, null, 'All notifications marked as read');
};
