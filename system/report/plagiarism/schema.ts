//  Query/response for plagiarism anomaly (53).

import { z } from '@hono/zod-openapi';

export const PlagiarismQuerySchema = z.object({
  actor_ids: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});
export type PlagiarismQuery = z.infer<
  typeof PlagiarismQuerySchema
>;

export const PlagiarismResponseSchema = z
  .object({
    anomalies: z.array(
      z.object({
        actor_id: z.string(),
        kind: z.string(),
        message: z.string().optional(),
      }),
    ),
  })
  .openapi('PlagiarismAnomalyResponse');
