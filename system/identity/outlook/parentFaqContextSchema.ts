import { z } from 'zod';

export const OutlookParentFaqContextRequestSchema = z
  .object({
    actor_id: z.string(),
    topic: z.string().optional(),
  });
export type OutlookParentFaqContextRequest = z.infer<
  typeof OutlookParentFaqContextRequestSchema
>;
