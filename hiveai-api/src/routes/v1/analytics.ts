import { Router } from 'express';
import * as analyticsController from '../../controllers/analyticsController';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { asyncHandler } from '../../utils/asyncHandler';
import { UserRole } from '../../constants';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

router.get('/overview', asyncHandler(analyticsController.getOverview as any));
router.get('/tasks/trend', asyncHandler(analyticsController.getTaskTrend as any));
router.get('/revenue/trend', asyncHandler(analyticsController.getRevenueTrend as any));
router.get('/approval-rates', asyncHandler(analyticsController.getApprovalRates as any));
router.get('/leaderboard', asyncHandler(analyticsController.getWorkerLeaderboard as any));
router.get('/average-payout', asyncHandler(analyticsController.getAveragePayout as any));
router.get('/quality/trend', asyncHandler(analyticsController.getQualityTrend as any));
router.get('/users/trend', asyncHandler(analyticsController.getNewUsersTrend as any));
router.get('/projects/completion', asyncHandler(analyticsController.getProjectCompletionRates as any));

export default router;
