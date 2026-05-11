import { Router } from 'express';
import * as uploadController from '../../controllers/uploadController';
import { authenticate } from '../../middlewares/authenticate';
import { upload } from '../../services/UploadService';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.post('/', upload.single('file'), asyncHandler(uploadController.uploadFile as any));

export default router;
