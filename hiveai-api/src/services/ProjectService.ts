import { projectRepository } from '../repositories/ProjectRepository';
import { taskRepository } from '../repositories/TaskRepository';
import { AppError } from '../middlewares/errorHandler';
import { ProjectStatus, TaskStatus, UserRole } from '../constants';
import { Project, IProject } from '../models/Project';

class ProjectService {
  async create(
    clientId: string,
    data: {
      title: string;
      description: string;
      taskType: string;
      budget: number;
      payoutPerTask: number;
      qualityThreshold?: number;
      settings?: Record<string, unknown>;
    }
  ): Promise<IProject> {
    return projectRepository.create({ ...data, clientId: clientId as any, taskType: data.taskType as any });
  }

  async getById(projectId: string, userId: string, role: UserRole): Promise<IProject> {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new AppError('Project not found', 404);

    if (role === UserRole.CLIENT && project.clientId.toString() !== userId) {
      throw new AppError('Access denied', 403);
    }

    return project;
  }

  async list(
    userId: string,
    role: UserRole,
    options: {
      page: number;
      limit: number;
      status?: string;
      taskType?: string;
      sort: string;
      order: 'asc' | 'desc';
    }
  ) {
    const filter: Record<string, unknown> = {};
    if (role === UserRole.CLIENT) filter.clientId = userId;
    if (options.status) filter.status = options.status;
    if (options.taskType) filter.taskType = options.taskType;

    const { projects, total } = await projectRepository.findMany(filter, {
      page: options.page,
      limit: options.limit,
      sort: options.sort,
      order: options.order,
    });

    return {
      projects,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  async update(
    projectId: string,
    userId: string,
    role: UserRole,
    data: Partial<IProject>
  ): Promise<IProject> {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new AppError('Project not found', 404);

    if (role === UserRole.CLIENT && project.clientId.toString() !== userId) {
      throw new AppError('Access denied', 403);
    }

    const updated = await projectRepository.updateById(projectId, data);
    if (!updated) throw new AppError('Failed to update project', 500);
    return updated;
  }

  async generateTasks(
    projectId: string,
    userId: string,
    role: UserRole,
    taskDataList: Array<{ inputData: Record<string, unknown> }>
  ): Promise<number> {
    const project = await this.getById(projectId, userId, role);

    if (project.status !== ProjectStatus.DRAFT && project.status !== ProjectStatus.ACTIVE) {
      throw new AppError('Cannot generate tasks for this project status', 400);
    }

    const tasks = taskDataList.map((item) => ({
      projectId: project._id,
      inputData: item.inputData,
      payoutAmount: project.payoutPerTask,
      status: TaskStatus.PENDING,
      priority: 0,
    }));

    const created = await taskRepository.createMany(tasks);

    await projectRepository.updateById(projectId, {
      totalTasks: project.totalTasks + created.length,
      status: ProjectStatus.ACTIVE,
    });

    return created.length;
  }

  async getStats(userId: string, role: UserRole) {
    const filter: Record<string, unknown> = {};
    if (role === UserRole.CLIENT) filter.clientId = userId;

    const results = await Project.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          tasksDone: { $sum: '$completedTasks' },
        },
      },
    ]).exec();

    const stats = { total: 0, active: 0, completed: 0, tasksDone: 0 };
    results.forEach((r: { _id: string; count: number; tasksDone: number }) => {
      stats.total += r.count;
      stats.tasksDone += r.tasksDone;
      if (r._id === ProjectStatus.ACTIVE) stats.active = r.count;
      if (r._id === ProjectStatus.COMPLETED) stats.completed = r.count;
    });

    return stats;
  }
}

export const projectService = new ProjectService();
