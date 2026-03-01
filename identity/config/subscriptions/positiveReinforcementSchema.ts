import { z } from 'zod';

export const OutlookPositiveReinforcementRequestSchema = z
  .object({
    actor_id: z.string(),
    from: z.string().optional(),
    to: z.string().optional(),
  });
export type OutlookPositiveReinforcementRequest = z.infer<
  typeof OutlookPositiveReinforcementRequestSchema
>;
