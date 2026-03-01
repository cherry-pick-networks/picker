import { z } from 'zod';

export const OutlookMissingHomeworkImpactRequestSchema = z
  .object({
    actor_id: z.string(),
    from: z.string().optional(),
    to: z.string().optional(),
  });
export type OutlookMissingHomeworkImpactRequest = z.infer<
  typeof OutlookMissingHomeworkImpactRequestSchema
>;
