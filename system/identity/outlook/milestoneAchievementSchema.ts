import { z } from 'zod';

export const OutlookMilestoneAchievementRequestSchema = z
  .object({
    actor_id: z.string(),
    from: z.string().optional(),
    to: z.string().optional(),
  });
export type OutlookMilestoneAchievementRequest = z.infer<
  typeof OutlookMilestoneAchievementRequestSchema
>;
