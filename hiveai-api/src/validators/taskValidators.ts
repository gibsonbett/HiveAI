import { z } from 'zod';
import { TaskStatus } from '../constants';

const taskStatusValues = Object.values(TaskStatus) as [string, ...string[]];

export const submitTaskSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    outputData: z.record(z.string(), z.unknown()),
  }),
});

export const listTasksSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
    status: z.enum(taskStatusValues).optional(),
    projectId: z.string().optional(),
    sort: z.string().optional().default('priority'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});
