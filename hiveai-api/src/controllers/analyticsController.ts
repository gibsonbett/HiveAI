import { Response } from 'express';
import { analyticsService } from '../services/AnalyticsService';
import { sendSuccess } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';
import { getOrSetCache } from '../utils/cache';

const ANALYTICS_CACHE_TTL = 60;

export const getOverview = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const overview = await getOrSetCache('analytics:overview', ANALYTICS_CACHE_TTL, () =>
    analyticsService.getPlatformOverview()
  );
  sendSuccess(res, overview);
};

export const getTaskTrend = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const days = parseInt(req.query.days as string) || 30;
  const normalizedDays = Math.min(days, 90);
  const trend = await getOrSetCache(`analytics:tasks:trend:${normalizedDays}`, ANALYTICS_CACHE_TTL, () =>
    analyticsService.getTaskCompletionTrend(normalizedDays)
  );
  sendSuccess(res, trend);
};

export const getRevenueTrend = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const days = parseInt(req.query.days as string) || 30;
  const normalizedDays = Math.min(days, 90);
  const trend = await getOrSetCache(`analytics:revenue:trend:${normalizedDays}`, ANALYTICS_CACHE_TTL, () =>
    analyticsService.getRevenueTrend(normalizedDays)
  );
  sendSuccess(res, trend);
};

export const getApprovalRates = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const rates = await getOrSetCache('analytics:approval:rates', ANALYTICS_CACHE_TTL, () =>
    analyticsService.getApprovalRates()
  );
  sendSuccess(res, rates);
};

export const getWorkerLeaderboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const limit = parseInt(req.query.limit as string) || 10;
  const normalizedLimit = Math.min(limit, 50);
  const leaderboard = await getOrSetCache(`analytics:leaderboard:${normalizedLimit}`, ANALYTICS_CACHE_TTL, () =>
    analyticsService.getWorkerLeaderboard(normalizedLimit)
  );
  sendSuccess(res, leaderboard);
};

export const getAveragePayout = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const data = await getOrSetCache('analytics:avg:payout', ANALYTICS_CACHE_TTL, () =>
    analyticsService.getAveragePayout()
  );
  sendSuccess(res, data);
};

export const getQualityTrend = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const days = parseInt(req.query.days as string) || 30;
  const normalizedDays = Math.min(days, 90);
  const trend = await getOrSetCache(`analytics:quality:trend:${normalizedDays}`, ANALYTICS_CACHE_TTL, () =>
    analyticsService.getQualityScoreTrend(normalizedDays)
  );
  sendSuccess(res, trend);
};

export const getNewUsersTrend = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const days = parseInt(req.query.days as string) || 30;
  const normalizedDays = Math.min(days, 90);
  const trend = await getOrSetCache(`analytics:users:trend:${normalizedDays}`, ANALYTICS_CACHE_TTL, () =>
    analyticsService.getNewUsersTrend(normalizedDays)
  );
  sendSuccess(res, trend);
};

export const getProjectCompletionRates = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const rates = await getOrSetCache('analytics:projects:completion', ANALYTICS_CACHE_TTL, () =>
    analyticsService.getProjectCompletionRates()
  );
  sendSuccess(res, rates);
};
