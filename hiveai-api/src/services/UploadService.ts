import multer from 'multer';
import { cloudinary } from '../config/cloudinary';
import { AppError } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';

const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'text/csv',
    'application/json',
    'application/zip',
    'application/x-zip-compressed',
    'audio/mpeg',
    'audio/wav',
    'video/mp4',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`File type ${file.mimetype} not allowed`, 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

class UploadService {
  async uploadToCloudinary(
    file: Express.Multer.File,
    folder: string
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `hiveai/${folder}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload error:', error);
            reject(new AppError('File upload failed', 500));
          } else if (result) {
            resolve({ url: result.secure_url, publicId: result.public_id });
          }
        }
      );
      uploadStream.end(file.buffer);
    });
  }
}

export const uploadService = new UploadService();
