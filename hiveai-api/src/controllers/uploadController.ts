import { Response } from 'express';
import { uploadService } from '../services/UploadService';
import { sendSuccess } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../middlewares/errorHandler';

export const uploadFile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.file) {
    throw new AppError('No file provided', 400);
  }

  const folder = (req.query.folder as string) || 'general';
  const result = await uploadService.uploadToCloudinary(req.file, folder);
  sendSuccess(res, result, 'File uploaded', 201);
};
