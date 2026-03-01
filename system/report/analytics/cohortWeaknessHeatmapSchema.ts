//  Request/response for cohort weakness heatmap.

import { z } from 'zod';

export const CohortWeaknessHeatmapRequestSchema = z.object({
  actor_ids: z.array(z.string()).min(1),
  scheme_id: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
});
export type CohortWeaknessHeatmapRequest = z.infer<
  typeof CohortWeaknessHeatmapRequestSchema
>;

export const CohortWeaknessHeatmapResponseSchema = z.object(
  {
    rows: z.array(z.object({
      actor_id: z.string(),
      code: z.string(),
      pass_rate: z.number(),
      pass_count: z.number(),
      total: z.number(),
    })),
  },
);
export type CohortWeaknessHeatmapResponse = z.infer<
  typeof CohortWeaknessHeatmapResponseSchema
>;
