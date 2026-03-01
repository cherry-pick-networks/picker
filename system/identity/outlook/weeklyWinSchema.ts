import { z } from 'zod';

export const OutlookWeeklyWinRequestSchema = z.object({
  actor_id: z.string(),
  week_start: z.string().optional(),
});
export type OutlookWeeklyWinRequest = z.infer<
  typeof OutlookWeeklyWinRequestSchema
>;
