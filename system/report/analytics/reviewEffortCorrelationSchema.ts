import { z } from 'zod';

export const ReviewEffortCorrelationRequestSchema = z
  .object({
    actor_id: z.string(),
    from: z.string().optional(),
    to: z.string().optional(),
  });
export type ReviewEffortCorrelationRequest = z.infer<
  typeof ReviewEffortCorrelationRequestSchema
>;
