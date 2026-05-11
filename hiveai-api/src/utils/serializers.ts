import { env } from '../config/env';

const isProduction = env.NODE_ENV === 'production';

const normalizeId = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && '_id' in value) {
    const id = (value as { _id?: unknown })._id;
    return id ? String(id) : null;
  }
  return null;
};

export const serializeUser = (user: any) => {
  if (!user) return null;
  if (!isProduction) return user;

  return {
    _id: String(user._id),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    kycStatus: user.kycStatus,
    skills: user.skills,
    walletBalance: user.walletBalance,
    pendingBalance: user.pendingBalance,
    accuracyScore: user.accuracyScore,
    trustScore: user.trustScore,
    subscriptionPlan: user.subscriptionPlan,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionEndsAt: user.subscriptionEndsAt,
    trialUsageCount: user.trialUsageCount,
    trialLimit: 3,
    emailVerified: user.emailVerified,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const serializeProject = (project: any) => {
  if (!project) return null;
  if (!isProduction) return project;

  const clientId = project.clientId;
  const serializedClient =
    clientId && typeof clientId === 'object'
      ? {
          _id: normalizeId(clientId),
          firstName: clientId.firstName,
          lastName: clientId.lastName,
        }
      : normalizeId(clientId);

  return {
    _id: String(project._id),
    title: project.title,
    description: project.description,
    clientId: serializedClient,
    taskType: project.taskType,
    datasetUrl: project.datasetUrl,
    status: project.status,
    budget: project.budget,
    payoutPerTask: project.payoutPerTask,
    qualityThreshold: project.qualityThreshold,
    totalTasks: project.totalTasks,
    completedTasks: project.completedTasks,
    settings: project.settings,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
};

export const serializeTask = (task: any) => {
  if (!task) return null;
  if (!isProduction) return task;

  const projectId = task.projectId;
  const assignedTo = task.assignedTo;

  const serializedProject =
    projectId && typeof projectId === 'object'
      ? {
          _id: normalizeId(projectId),
          title: projectId.title,
          taskType: projectId.taskType,
        }
      : normalizeId(projectId);

  const serializedAssignee =
    assignedTo && typeof assignedTo === 'object'
      ? {
          _id: normalizeId(assignedTo),
          firstName: assignedTo.firstName,
          lastName: assignedTo.lastName,
        }
      : normalizeId(assignedTo);

  return {
    _id: String(task._id),
    projectId: serializedProject,
    assignedTo: serializedAssignee,
    status: task.status,
    inputData: task.inputData,
    outputData: task.outputData,
    reviewStatus: task.reviewStatus,
    qualityScore: task.qualityScore,
    payoutAmount: task.payoutAmount,
    priority: task.priority,
    startedAt: task.startedAt,
    submittedAt: task.submittedAt,
    timeLimit: task.timeLimit,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
};
