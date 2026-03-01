//  Request schema for clustering API.

import { z } from '@hono/zod-openapi';

export const ClusterRequestSchema = z
  .object({
    actor_ids: z.array(z.string()).min(1),
    scheme_id: z.string(),
    from: z.string().optional(),
    to: z.string().optional(),
  })
  .openapi('ClusterRequest');
export type ClusterRequest = z.infer<
  typeof ClusterRequestSchema
>;
