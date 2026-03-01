import { z } from 'zod';

export const NodeDensityScoreRequestSchema = z.object({
  actor_id: z.string().optional(),
  scheme_id: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
});
export type NodeDensityScoreRequest = z.infer<
  typeof NodeDensityScoreRequestSchema
>;
