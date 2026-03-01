//  Partial score (54) and formative-summative gap (55).

import { z } from '@hono/zod-openapi';

export const PartialScoreQuerySchema = z.object({
  actor_id: z.string(),
  item_id: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});
export type PartialScoreQuery = z.infer<
  typeof PartialScoreQuerySchema
>;

export const FormativeSummativeGapQuerySchema = z.object({
  actor_id: z.string(),
  scheme_id: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
});
export type FormativeSummativeGapQuery = z.infer<
  typeof FormativeSummativeGapQuerySchema
>;

export const PartialScoreResponseSchema = z
  .object({
    scores: z.array(z.record(z.string(), z.unknown())),
  })
  .openapi('PartialScoreResponse');

export const FormativeSummativeGapResponseSchema = z
  .object({ gap: z.record(z.string(), z.unknown()) })
  .openapi('FormativeSummativeGapResponse');
