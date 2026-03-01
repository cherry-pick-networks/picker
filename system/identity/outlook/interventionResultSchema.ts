import { z } from 'zod';

export const OutlookInterventionResultRequestSchema = z
  .object({
    actor_id: z.string(),
    from: z.string().optional(),
    to: z.string().optional(),
  });
export type OutlookInterventionResultRequest = z.infer<
  typeof OutlookInterventionResultRequestSchema
>;
