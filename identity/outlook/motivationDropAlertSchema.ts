import { z } from 'zod';

export const OutlookMotivationDropAlertRequestSchema = z
  .object({
    actor_id: z.string(),
    from: z.string().optional(),
    to: z.string().optional(),
  });
export type OutlookMotivationDropAlertRequest = z.infer<
  typeof OutlookMotivationDropAlertRequestSchema
>;
