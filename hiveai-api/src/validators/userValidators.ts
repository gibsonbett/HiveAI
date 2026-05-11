import { z } from 'zod';
import { UserRole, UserStatus } from '../constants';

const userRoleValues = Object.values(UserRole) as [string, ...string[]];
const userStatusValues = Object.values(UserStatus) as [string, ...string[]];

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(50).trim().optional(),
    lastName: z.string().min(1).max(50).trim().optional(),
    phone: z.string().min(10).max(15).optional(),
    skills: z.array(z.string().trim()).optional(),
  }),
});

export const updateUserStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(userStatusValues),
  }),
});

export const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    role: z.enum(userRoleValues),
  }),
});

export const approveUserSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const listUsersSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
    role: z.enum(userRoleValues).optional(),
    status: z.enum(userStatusValues).optional(),
    search: z.string().optional(),
    sort: z.string().optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});
