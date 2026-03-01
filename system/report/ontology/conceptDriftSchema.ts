//  Concept drift (57).

import { z } from '@hono/zod-openapi';

export const ConceptDriftQuerySchema = z.object({
  scheme_id: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
});
export type ConceptDriftQuery = z.infer<
  typeof ConceptDriftQuerySchema
>;

export const ConceptDriftResponseSchema = z
  .object({
    drift: z.array(z.record(z.string(), z.unknown())),
  })
  .openapi('ConceptDriftResponse');
