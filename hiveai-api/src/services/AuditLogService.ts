import { AuditLog } from '../models/AuditLog';
import { Types } from 'mongoose';

class AuditLogService {
  async log(data: {
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
    ipAddress: string;
    userAgent: string;
  }): Promise<void> {
    await AuditLog.create({
      userId: new Types.ObjectId(data.userId),
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId ? new Types.ObjectId(data.resourceId) : undefined,
      metadata: data.metadata,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });
  }

  async getByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments({ userId }),
    ]);
    return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getRecent(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName email role')
        .lean(),
      AuditLog.countDocuments(),
    ]);
    return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

export const auditLogService = new AuditLogService();
