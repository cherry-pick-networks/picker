//  Request schema for bottleneck dashboard.

import { z } from 'zod';

export const BottleneckRequestSchema = z.object({
  actor_ids: z.array(z.string()).min(1),
  scheme_id: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
  min_fail_count: z.number().int().min(0).optional(),
});
export type BottleneckRequest = z.infer<
  typeof BottleneckRequestSchema
>;
