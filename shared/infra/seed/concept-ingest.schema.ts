/**
 * Zod schema for LLM concept ingestion output (Scope 4).
 * Concept IDs may use prefixes subj-, type-, cog-, ctx- or existing (e.g. ddc-).
 */

import { z } from "zod";

const CONCEPT_RELATION_TYPES = [
  "broader",
  "narrower",
  "related",
  "exactMatch",
  "requires",
] as const;

export const ConceptIngestItemSchema = z.object({
  id: z.string().min(1),
  scheme_id: z.string().min(1),
  pref_label: z.string().min(1),
  notation: z.string().optional(),
  source: z.string().optional(),
});

export const ConceptIngestRelationSchema = z.object({
  source_id: z.string().min(1),
  target_id: z.string().min(1),
  relation_type: z.enum(CONCEPT_RELATION_TYPES),
});

export const ConceptIngestOutputSchema = z.object({
  concepts: z.array(ConceptIngestItemSchema),
  relations: z.array(ConceptIngestRelationSchema).optional(),
});

export type ConceptIngestOutput = z.infer<typeof ConceptIngestOutputSchema>;
export type ConceptIngestItem = z.infer<typeof ConceptIngestItemSchema>;
export type ConceptIngestRelation = z.infer<typeof ConceptIngestRelationSchema>;

export const ALLOWED_RELATION_TYPES: readonly string[] = CONCEPT_RELATION_TYPES;
