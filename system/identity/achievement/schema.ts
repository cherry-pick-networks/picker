//  Zod schemas for concept outcome and item response.

import { z } from 'zod';

export const ConceptOutcomeSchema = z.object({
  actor_id: z.string(),
  scheme_id: z.string(),
  code: z.string(),
  passed: z.boolean(),
  recorded_at: z.string(),
});
export type ConceptOutcome = z.infer<
  typeof ConceptOutcomeSchema
>;

export const ItemResponseSchema = z.object({
  id: z.number(),
  actor_id: z.string(),
  item_id: z.string(),
  selected_option_index: z.number(),
  correct: z.boolean(),
  recorded_at: z.string(),
});
export type ItemResponse = z.infer<
  typeof ItemResponseSchema
>;

export const UpsertConceptOutcomeBodySchema = z.object({
  actor_id: z.string(),
  scheme_id: z.string(),
  code: z.string(),
  passed: z.boolean(),
});
export type UpsertConceptOutcomeBody = z.infer<
  typeof UpsertConceptOutcomeBodySchema
>;

export const RecordItemResponseBodySchema = z.object({
  actor_id: z.string(),
  item_id: z.string(),
  selected_option_index: z.number().int().min(0),
  correct: z.boolean(),
});
export type RecordItemResponseBody = z.infer<
  typeof RecordItemResponseBodySchema
>;
