import { z } from 'zod';
import { ReviewDecision } from '../constants';

const reviewDecisionValues = Object.values(ReviewDecision) as [string, ...string[]];

export const submitReviewSchema = z.object({
  body: z.object({
    taskId: z.string().min(1),
    decision: z.enum(reviewDecisionValues),
    comments: z.string().max(1000).optional(),
    score: z.number().min(0).max(100),
  }),
});

export const listReviewsSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
  }),
});
