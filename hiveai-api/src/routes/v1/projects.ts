import { Router } from 'express';
import * as projectController from '../../controllers/projectController';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import { UserRole } from '../../constants';
import { createProjectSchema, updateProjectSchema, listProjectsSchema } from '../../validators/projectValidators';

const router = Router();

router.use(authenticate);

router.post('/', authorize(UserRole.CLIENT, UserRole.ADMIN), validate(createProjectSchema), asyncHandler(projectController.createProject as any));
router.get('/stats', asyncHandler(projectController.getProjectStats as any));
router.get('/', validate(listProjectsSchema), asyncHandler(projectController.listProjects as any));
router.get('/:id', asyncHandler(projectController.getProject as any));
router.patch('/:id', authorize(UserRole.CLIENT, UserRole.ADMIN), validate(updateProjectSchema), asyncHandler(projectController.updateProject as any));
router.post('/:id/generate-tasks', authorize(UserRole.CLIENT, UserRole.ADMIN), asyncHandler(projectController.generateTasks as any));

export default router;
