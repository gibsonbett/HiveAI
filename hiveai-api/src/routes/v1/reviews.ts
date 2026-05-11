import { Router } from 'express';
import * as reviewController from '../../controllers/reviewController';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import { UserRole } from '../../constants';
import { submitReviewSchema } from '../../validators/reviewValidators';

const router = Router();

router.use(authenticate);

router.get('/queue', authorize(UserRole.REVIEWER, UserRole.ADMIN), asyncHandler(reviewController.getReviewQueue as any));
router.get('/stats', authorize(UserRole.REVIEWER), asyncHandler(reviewController.getReviewerStats as any));
router.post('/', authorize(UserRole.REVIEWER, UserRole.ADMIN), validate(submitReviewSchema), asyncHandler(reviewController.submitReview as any));
router.get('/task/:taskId', asyncHandler(reviewController.getTaskReviews as any));

export default router;
