import { Review, IReview } from '../models/Review';

export class ReviewRepository {
  async create(data: Partial<IReview>): Promise<IReview> {
    return Review.create(data);
  }

  async findById(id: string): Promise<IReview | null> {
    return Review.findById(id)
      .populate('taskId')
      .populate('reviewerId', 'firstName lastName email')
      .exec();
  }

  async findByTaskId(taskId: string): Promise<IReview[]> {
    return Review.find({ taskId })
      .populate('reviewerId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findMany(
    filter: Record<string, unknown>,
    options: { page: number; limit: number }
  ): Promise<{ reviews: IReview[]; total: number }> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('taskId')
        .populate('reviewerId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Review.countDocuments(filter).exec(),
    ]);

    return { reviews, total };
  }

  async getReviewerStats(reviewerId: string): Promise<{ total: number; approved: number; rejected: number }> {
    const results = await Review.aggregate([
      { $match: { reviewerId } },
      { $group: { _id: '$decision', count: { $sum: 1 } } },
    ]).exec();

    const stats = { total: 0, approved: 0, rejected: 0 };
    results.forEach((r: { _id: string; count: number }) => {
      stats.total += r.count;
      if (r._id === 'approved') stats.approved = r.count;
      if (r._id === 'rejected') stats.rejected = r.count;
    });
    return stats;
  }
}

export const reviewRepository = new ReviewRepository();
