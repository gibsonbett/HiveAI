import { Router } from 'express';
import * as notificationController from '../../controllers/notificationController';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { UserRole } from '../../constants';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/fraud-alerts', authorize(UserRole.ADMIN), asyncHandler(notificationController.getFraudAlerts as any));
router.get('/', asyncHandler(notificationController.getNotifications as any));
router.patch('/:id/read', asyncHandler(notificationController.markAsRead as any));
router.patch('/read-all', asyncHandler(notificationController.markAllAsRead as any));

export default router;
