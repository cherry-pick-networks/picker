import { z } from 'zod';

export const OutlookRelativePositionRequestSchema = z
  .object({
    actor_id: z.string(),
    scheme_id: z.string(),
    from: z.string().optional(),
    to: z.string().optional(),
  });
export type OutlookRelativePositionRequest = z.infer<
  typeof OutlookRelativePositionRequestSchema
>;
