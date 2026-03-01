//  Request schema for anomaly detection.

import { z } from 'zod';

export const AnomalyRequestSchema = z.object({
  actor_ids: z.array(z.string()).min(1),
  scheme_id: z.string(),
  recent_days: z.number().int().min(1).optional(),
  baseline_days: z.number().int().min(1).optional(),
  drop_threshold: z.number().min(0).max(1).optional(),
});
export type AnomalyRequest = z.infer<
  typeof AnomalyRequestSchema
>;
