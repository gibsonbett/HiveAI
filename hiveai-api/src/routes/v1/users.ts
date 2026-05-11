import { Router } from 'express';
import * as userController from '../../controllers/userController';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import { UserRole } from '../../constants';
import {
  updateProfileSchema,
  updateUserStatusSchema,
  updateUserRoleSchema,
  approveUserSchema,
  listUsersSchema,
} from '../../validators/userValidators';

const router = Router();

router.use(authenticate);

router.get('/me', asyncHandler(userController.getMe as any));
router.patch('/me', validate(updateProfileSchema), asyncHandler(userController.updateMe as any));

router.get('/stats', authorize(UserRole.ADMIN), asyncHandler(userController.getDashboardStats as any));
router.get('/audit-logs', authorize(UserRole.ADMIN), asyncHandler(userController.getAuditLogs as any));
router.get('/', authorize(UserRole.ADMIN), validate(listUsersSchema), asyncHandler(userController.listUsers as any));
router.get('/:id', authorize(UserRole.ADMIN), asyncHandler(userController.getUserById as any));
router.patch('/:id/status', authorize(UserRole.ADMIN), validate(updateUserStatusSchema), asyncHandler(userController.updateUserStatus as any));
router.patch('/:id/role', authorize(UserRole.ADMIN), validate(updateUserRoleSchema), asyncHandler(userController.updateUserRole as any));
router.post('/:id/approve', authorize(UserRole.ADMIN), validate(approveUserSchema), asyncHandler(userController.approveUser as any));

export default router;
