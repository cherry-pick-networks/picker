//  Source and extract schemas (Zod).

import { z } from 'zod';

//  type = document type: doctype scheme code (Schema.org or BibTeX).
export const SourceSchema = z.object({
  source_id: z.string(),
  url: z.string().optional(),
  type: z.string().optional(),
  collected_at: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  body: z.string().optional(),
  extracted_at: z.string().optional(),
  extracted_concept_ids: z.array(z.string()).optional(),
  extracted_subject_id: z.string().optional(),
});
export type Source = z.infer<typeof SourceSchema>;

export const CreateSourceRequestSchema = SourceSchema.omit({
  source_id: true,
  collected_at: true,
}).extend({
  source_id: z.string().optional(),
  collected_at: z.string().optional(),
});
export type CreateSourceRequest = z.infer<
  typeof CreateSourceRequestSchema
>;

//  LLM extract response: concept_ids required, subject_id optional.
export const SourceExtractOutputSchema = z.object({
  concept_ids: z.array(z.string()),
  subject_id: z.string().optional(),
});
export type SourceExtractOutput = z.infer<
  typeof SourceExtractOutputSchema
>;
