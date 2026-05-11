import { Transaction, ITransaction } from '../models/Transaction';
import { TransactionStatus, TransactionType } from '../constants';

export class TransactionRepository {
  async create(data: Partial<ITransaction>): Promise<ITransaction> {
    return Transaction.create(data);
  }

  async findById(id: string): Promise<ITransaction | null> {
    return Transaction.findById(id).populate('userId', 'firstName lastName email').exec();
  }

  async findByMpesaReceipt(receipt: string): Promise<ITransaction | null> {
    return Transaction.findOne({ mpesaReceipt: receipt }).exec();
  }

  async findMany(
    filter: Record<string, unknown>,
    options: { page: number; limit: number }
  ): Promise<{ transactions: ITransaction[]; total: number }> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Transaction.countDocuments(filter).exec(),
    ]);

    return { transactions, total };
  }

  async updateById(id: string, update: Record<string, unknown>): Promise<ITransaction | null> {
    return Transaction.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async getUserBalance(userId: string): Promise<{ earnings: number; withdrawals: number }> {
    const results = await Transaction.aggregate([
      {
        $match: {
          userId: new (await import('mongoose')).default.Types.ObjectId(userId),
          status: TransactionStatus.COMPLETED,
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]).exec();

    let earnings = 0;
    let withdrawals = 0;
    results.forEach((r: { _id: string; total: number }) => {
      if (r._id === TransactionType.EARNING || r._id === TransactionType.DEPOSIT || r._id === TransactionType.BONUS) {
        earnings += r.total;
      }
      if (r._id === TransactionType.WITHDRAWAL) {
        withdrawals += r.total;
      }
    });

    return { earnings, withdrawals };
  }
}

export const transactionRepository = new TransactionRepository();
