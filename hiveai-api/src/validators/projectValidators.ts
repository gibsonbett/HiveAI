import { z } from 'zod';
import { TaskType, ProjectStatus } from '../constants';

const taskTypeValues = Object.values(TaskType) as [string, ...string[]];
const projectStatusValues = Object.values(ProjectStatus) as [string, ...string[]];

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).trim(),
    description: z.string().min(1).max(2000).trim(),
    taskType: z.enum(taskTypeValues),
    budget: z.number().min(0),
    payoutPerTask: z.number().min(0),
    qualityThreshold: z.number().min(0).max(100).optional().default(80),
    settings: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    title: z.string().min(1).max(200).trim().optional(),
    description: z.string().min(1).max(2000).trim().optional(),
    status: z.enum(projectStatusValues).optional(),
    budget: z.number().min(0).optional(),
    payoutPerTask: z.number().min(0).optional(),
    qualityThreshold: z.number().min(0).max(100).optional(),
    settings: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const listProjectsSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
    status: z.enum(projectStatusValues).optional(),
    taskType: z.enum(taskTypeValues).optional(),
    sort: z.string().optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});
