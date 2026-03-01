import { z } from 'zod';

export const StudyTimeRoiRequestSchema = z.object({
  actor_ids: z.array(z.string()).min(1),
  scheme_id: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
});
export type StudyTimeRoiRequest = z.infer<
  typeof StudyTimeRoiRequestSchema
>;
