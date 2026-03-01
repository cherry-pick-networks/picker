import { z } from 'zod';

export const OutlookCustomGoalTrackingRequestSchema = z
  .object({
    actor_id: z.string(),
  });
export type OutlookCustomGoalTrackingRequest = z.infer<
  typeof OutlookCustomGoalTrackingRequestSchema
>;
