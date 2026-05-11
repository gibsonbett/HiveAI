import { z } from 'zod';

export const depositSchema = z.object({
  body: z.object({
    amount: z.number().min(1, 'Minimum deposit is KES 1').max(150000, 'Maximum deposit is KES 150,000'),
    phoneNumber: z.string().min(10).max(15).regex(/^(\+?254|0)\d{9}$/, 'Invalid phone number format'),
  }),
});

export const withdrawalSchema = z.object({
  body: z.object({
    amountUsd: z.number().min(1, 'Minimum withdrawal is USD 1').max(1000, 'Maximum withdrawal is USD 1,000'),
    phoneNumber: z.string().min(10).max(15).regex(/^(\+?254|0)\d{9}$/, 'Invalid phone number format'),
  }),
});

export const upgradePlanSchema = z.object({
  body: z.object({
    planId: z.enum(['basic', 'silver', 'gold', 'platinum']),
    phoneNumber: z.string().min(10).max(15).regex(/^(\+?254|0)\d{9}$/, 'Invalid phone number format'),
  }),
});

export const rejectWithdrawalSchema = z.object({
  body: z.object({
    reason: z.string().min(1).max(500).optional(),
  }),
});
