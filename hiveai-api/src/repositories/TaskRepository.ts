import { Task, ITask } from '../models/Task';
import { TaskStatus } from '../constants';

export class TaskRepository {
  async create(data: Partial<ITask>): Promise<ITask> {
    return Task.create(data);
  }

  async createMany(data: Partial<ITask>[]): Promise<ITask[]> {
    const result = await Task.insertMany(data);
    return result as unknown as ITask[];
  }

  async findById(id: string): Promise<ITask | null> {
    return Task.findById(id)
      .populate('projectId', 'title taskType')
      .populate('assignedTo', 'firstName lastName email')
      .exec();
  }

  async findMany(
    filter: Record<string, unknown>,
    options: { page: number; limit: number; sort: string; order: 'asc' | 'desc' }
  ): Promise<{ tasks: ITask[]; total: number }> {
    const { page, limit, sort, order } = options;
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('projectId', 'title taskType')
        .populate('assignedTo', 'firstName lastName')
        .sort({ [sort]: order === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Task.countDocuments(filter).exec(),
    ]);

    return { tasks, total };
  }

  async updateById(id: string, update: Record<string, unknown>): Promise<ITask | null> {
    return Task.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async findAvailableForWorker(
    _workerId: string,
    options: { page: number; limit: number }
  ): Promise<{ tasks: ITask[]; total: number }> {
    const filter: Record<string, unknown> = {
      status: TaskStatus.PENDING,
      assignedTo: { $exists: false },
    };

    return this.findMany(filter, { ...options, sort: 'priority', order: 'desc' });
  }

  async countByStatus(projectId: string): Promise<Record<string, number>> {
    const results = await Task.aggregate([
      { $match: { projectId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]).exec();
    return results.reduce((acc: Record<string, number>, r: { _id: string; count: number }) => {
      acc[r._id] = r.count;
      return acc;
    }, {});
  }
}

export const taskRepository = new TaskRepository();
