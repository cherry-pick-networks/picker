//  Request schema for root-cause analysis.

import { z } from '@hono/zod-openapi';

export const RootCauseRequestSchema = z
  .object({
    actor_id: z.string(),
    scheme_id: z.string(),
    from: z.string().optional(),
    to: z.string().optional(),
  })
  .openapi('RootCauseRequest');
export type RootCauseRequest = z.infer<
  typeof RootCauseRequestSchema
>;
