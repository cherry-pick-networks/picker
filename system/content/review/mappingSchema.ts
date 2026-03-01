//  Zod schemas for review text → ontology mapping (LLM + allowlist).

import { z } from 'zod';

export const ReviewMappingRequestSchema = z.object({
  review_text: z.string().min(1).max(50_000),
});
export type ReviewMappingRequest = z.infer<
  typeof ReviewMappingRequestSchema
>;

//  LLM raw output: concept_ids only; validated against allowlist in service.
export const ReviewMappingLlmOutputSchema = z.object({
  concept_ids: z.array(z.string()),
});
export type ReviewMappingLlmOutput = z.infer<
  typeof ReviewMappingLlmOutputSchema
>;

export const ReviewMappingResponseSchema = z.object({
  concept_ids: z.array(z.string()),
  mapped_at: z.string(),
});
export type ReviewMappingResponse = z.infer<
  typeof ReviewMappingResponseSchema
>;
