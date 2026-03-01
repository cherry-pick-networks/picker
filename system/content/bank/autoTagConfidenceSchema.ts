//  Schema for auto-tag confidence API (59).

import { z } from '@hono/zod-openapi';

export const AutoTagConfidenceQuerySchema = z.object({
  item_id: z.string().optional(),
  concept_ids: z.string().optional(),
});
export type AutoTagConfidenceQuery = z.infer<
  typeof AutoTagConfidenceQuerySchema
>;

export const AutoTagConfidenceResponseSchema = z
  .object({
    confidence: z.array(z.record(z.string(), z.unknown())),
  })
  .openapi('AutoTagConfidenceResponse');
