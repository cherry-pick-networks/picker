import { z } from 'zod';

export const PacingDeviationRequestSchema = z.object({
  actor_id: z.string(),
  scheme_id: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
});
export type PacingDeviationRequest = z.infer<
  typeof PacingDeviationRequestSchema
>;
