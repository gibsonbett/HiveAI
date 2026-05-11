import { Response } from 'express';
import { reviewService } from '../services/ReviewService';
import { sendSuccess } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';
import { getParam } from '../utils/params';

export const getReviewQueue = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { page, limit } = req.query as any;
  const result = await reviewService.getReviewQueue({
    page: parseInt(page) || 1,
    limit: Math.min(parseInt(limit) || 20, 100),
  });

  sendSuccess(res, result.tasks, 'Review queue retrieved', 200, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
};

export const submitReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const review = await reviewService.submitReview(req.user!.userId, req.body);
  sendSuccess(res, review, 'Review submitted', 201);
};

export const getTaskReviews = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const reviews = await reviewService.getTaskReviews(getParam(req.params.taskId));
  sendSuccess(res, reviews);
};

export const getReviewerStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const stats = await reviewService.getReviewerStats(req.user!.userId);
  sendSuccess(res, stats);
};
