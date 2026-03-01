import { z } from 'zod';

export const OutlookNextMonthPreviewRequestSchema = z
  .object({
    actor_id: z.string(),
    as_of: z.string().optional(),
  });
export type OutlookNextMonthPreviewRequest = z.infer<
  typeof OutlookNextMonthPreviewRequestSchema
>;
