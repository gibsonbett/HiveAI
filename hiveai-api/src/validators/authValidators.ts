import { z } from 'zod';
import { UserRole } from '../constants';

const publicUserRoleValues = [UserRole.CLIENT, UserRole.WORKER, UserRole.REVIEWER] as [string, ...string[]];

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(50).trim(),
    lastName: z.string().min(1).max(50).trim(),
    email: z.string().email().toLowerCase().trim(),
    phone: z.string().min(10).max(15).optional(),
    password: z.string().min(8).max(128),
    role: z.enum(publicUserRoleValues).optional().default(UserRole.WORKER),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase().trim(),
    password: z.string().min(1),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase().trim(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(8).max(128),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1),
  }),
});

export const approveSignupSchema = z.object({
  body: z.object({
    userId: z.string().min(1),
    token: z.string().min(1),
  }),
});
