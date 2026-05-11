import { User } from '../models/User';
import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { Transaction } from '../models/Transaction';
import { Review } from '../models/Review';
import { TaskStatus, TransactionType, TransactionStatus, ReviewDecision, UserRole } from '../constants';

class AnalyticsService {
  async getPlatformOverview() {
    const [
      totalUsers,
      totalWorkers,
      totalClients,
      totalProjects,
      totalTasks,
      completedTasks,
      totalRevenue,
      totalPayouts,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: UserRole.WORKER }),
      User.countDocuments({ role: UserRole.CLIENT }),
      Project.countDocuments(),
      Task.countDocuments(),
      Task.countDocuments({ status: TaskStatus.APPROVED }),
      Transaction.aggregate([
        { $match: { type: TransactionType.DEPOSIT, status: TransactionStatus.COMPLETED } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { type: TransactionType.WITHDRAWAL, status: TransactionStatus.COMPLETED } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    return {
      totalUsers,
      totalWorkers,
      totalClients,
      totalProjects,
      totalTasks,
      completedTasks,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalPayouts: totalPayouts[0]?.total || 0,
    };
  }

  async getTaskCompletionTrend(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trend = await Task.aggregate([
      {
        $match: {
          submittedAt: { $gte: startDate },
          status: { $in: [TaskStatus.APPROVED, TaskStatus.SUBMITTED, TaskStatus.REJECTED] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } },
          completed: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return trend.map((d) => ({ date: d._id, completed: d.completed }));
  }

  async getRevenueTrend(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trend = await Transaction.aggregate([
      {
        $match: {
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.COMPLETED,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return trend.map((d) => ({ date: d._id, revenue: d.revenue }));
  }

  async getApprovalRates() {
    const [approved, rejected, needsRevision, total] = await Promise.all([
      Review.countDocuments({ decision: ReviewDecision.APPROVED }),
      Review.countDocuments({ decision: ReviewDecision.REJECTED }),
      Review.countDocuments({ decision: ReviewDecision.NEEDS_REVISION }),
      Review.countDocuments(),
    ]);

    return {
      approved,
      rejected,
      needsRevision,
      total,
      approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
      rejectionRate: total > 0 ? Math.round((rejected / total) * 100) : 0,
    };
  }

  async getWorkerLeaderboard(limit = 10) {
    const workers = await User.find({ role: UserRole.WORKER })
      .sort({ accuracyScore: -1 })
      .limit(limit)
      .select('firstName lastName accuracyScore trustScore walletBalance')
      .lean();

    return workers;
  }

  async getAveragePayout() {
    const result = await Transaction.aggregate([
      { $match: { type: TransactionType.EARNING, status: TransactionStatus.COMPLETED } },
      { $group: { _id: null, avgPayout: { $avg: '$amount' }, totalPayouts: { $sum: 1 } } },
    ]);

    return {
      averagePayout: result[0]?.avgPayout ? Math.round(result[0].avgPayout * 100) / 100 : 0,
      totalPayouts: result[0]?.totalPayouts || 0,
    };
  }

  async getQualityScoreTrend(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trend = await Review.aggregate([
      { $match: { createdAt: { $gte: startDate }, score: { $exists: true } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          avgScore: { $avg: '$score' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return trend.map((d) => ({
      date: d._id,
      avgScore: Math.round(d.avgScore * 100) / 100,
      count: d.count,
    }));
  }

  async getNewUsersTrend(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trend = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return trend.map((d) => ({ date: d._id, count: d.count }));
  }

  async getProjectCompletionRates() {
    const projects = await Project.aggregate([
      {
        $project: {
          title: 1,
          totalTasks: 1,
          completedTasks: 1,
          completionRate: {
            $cond: [
              { $gt: ['$totalTasks', 0] },
              { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
              0,
            ],
          },
        },
      },
      { $sort: { completionRate: -1 } },
      { $limit: 10 },
    ]);

    return projects;
  }
}

export const analyticsService = new AnalyticsService();
