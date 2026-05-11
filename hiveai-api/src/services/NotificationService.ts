import { Notification, INotification } from '../models/Notification';
import { NotificationType } from '../constants';

class NotificationService {
  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
  }): Promise<INotification> {
    return Notification.create({ ...data, userId: data.userId as any });
  }

  async getUserNotifications(
    userId: string,
    options: { page: number; limit: number }
  ) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Notification.countDocuments({ userId }).exec(),
      Notification.countDocuments({ userId, read: false }).exec(),
    ]);

    return {
      notifications,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true }
    ).exec();
  }

  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany({ userId, read: false }, { read: true }).exec();
  }

  async getFraudAlertsForAdmin(
    userId: string,
    options: { page: number; limit: number }
  ) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;
    const filter = {
      userId,
      type: NotificationType.SYSTEM,
      'metadata.category': 'fraud',
    };

    const [alerts, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Notification.countDocuments(filter).exec(),
      Notification.countDocuments({ ...filter, read: false }).exec(),
    ]);

    return {
      alerts,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const notificationService = new NotificationService();
