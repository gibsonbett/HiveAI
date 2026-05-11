import { Router } from 'express';
import * as taskController from '../../controllers/taskController';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import { UserRole } from '../../constants';
import { submitTaskSchema, listTasksSchema } from '../../validators/taskValidators';

const router = Router();

router.use(authenticate);

router.get('/', validate(listTasksSchema), asyncHandler(taskController.listTasks as any));
router.get('/worker-stats', authorize(UserRole.WORKER), asyncHandler(taskController.getWorkerStats as any));
router.get('/worker/stats', authorize(UserRole.WORKER), asyncHandler(taskController.getWorkerStats as any));
router.get('/available', authorize(UserRole.WORKER), asyncHandler(taskController.getAvailableTasks as any));
router.get('/:id', asyncHandler(taskController.getTask as any));
router.post('/:id/assign', authorize(UserRole.WORKER), asyncHandler(taskController.assignTask as any));
router.post('/:id/submit', authorize(UserRole.WORKER), validate(submitTaskSchema), asyncHandler(taskController.submitTask as any));
router.post('/:id/skip', authorize(UserRole.WORKER), asyncHandler(taskController.skipTask as any));

export default router;
