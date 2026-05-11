import { Project, IProject } from '../models/Project';

export class ProjectRepository {
  async create(data: Partial<IProject>): Promise<IProject> {
    return Project.create(data);
  }

  async findById(id: string): Promise<IProject | null> {
    return Project.findById(id).populate('clientId', 'firstName lastName email').exec();
  }

  async findMany(
    filter: Record<string, unknown>,
    options: { page: number; limit: number; sort: string; order: 'asc' | 'desc' }
  ): Promise<{ projects: IProject[]; total: number }> {
    const { page, limit, sort, order } = options;
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('clientId', 'firstName lastName email')
        .sort({ [sort]: order === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Project.countDocuments(filter).exec(),
    ]);

    return { projects, total };
  }

  async updateById(id: string, update: Record<string, unknown>): Promise<IProject | null> {
    return Project.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async incrementCompletedTasks(id: string): Promise<void> {
    await Project.findByIdAndUpdate(id, { $inc: { completedTasks: 1 } }).exec();
  }
}

export const projectRepository = new ProjectRepository();
