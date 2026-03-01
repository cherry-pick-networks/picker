import { z } from 'zod';

export const CurriculumBottleneckRequestSchema = z.object({
  actor_ids: z.array(z.string()).min(1),
  scheme_id: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
});
export type CurriculumBottleneckRequest = z.infer<
  typeof CurriculumBottleneckRequestSchema
>;
