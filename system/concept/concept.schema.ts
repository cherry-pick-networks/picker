/**
 * Zod schemas and types for concept scheme and concept.
 * Concept IDs may use prefixes subj-, type-, cog-, ctx- (Scope 3 tagging).
 */

import { z } from "zod";

/** Prefix for subject facet. */
export const SubjectIdSchema = z.string().regex(/^subj-/);
/** Prefix for content type facet. */
export const ContentTypeIdSchema = z.string().regex(/^type-/);
/** Prefix for cognitive level facet. */
export const CognitiveLevelIdSchema = z.string().regex(/^cog-/);
/** Prefix for context facet. */
export const ContextIdSchema = z.string().regex(/^ctx-/);

/** Any concept ID with allowed prefix (for allowlist validation). */
export const ConceptIdPrefixSchema = z
  .string()
  .regex(/^(subj-|type-|cog-|ctx-)/);

export const ConceptSchemeSchema = z.object({
  id: z.string(),
  prefLabel: z.string(),
  createdAt: z.string(),
});
export type ConceptScheme = z.infer<typeof ConceptSchemeSchema>;

export const ConceptSchema = z.object({
  id: z.string(),
  schemeId: z.string(),
  prefLabel: z.string(),
  notation: z.string().nullable(),
  source: z.string().nullable(),
  path: z.string().nullable(),
  createdAt: z.string(),
});
export type Concept = z.infer<typeof ConceptSchema>;

function rowToScheme(row: {
  id: string;
  pref_label: string;
  created_at: string;
}): ConceptScheme {
  return {
    id: row.id,
    prefLabel: row.pref_label,
    createdAt: row.created_at,
  };
}

function rowToConcept(row: {
  id: string;
  scheme_id: string;
  pref_label: string;
  notation: string | null;
  source: string | null;
  path: string | null;
  created_at: string;
}): Concept {
  return {
    id: row.id,
    schemeId: row.scheme_id,
    prefLabel: row.pref_label,
    notation: row.notation,
    source: row.source,
    path: row.path,
    createdAt: row.created_at,
  };
}

export function schemeRowToScheme(row: {
  id: string;
  pref_label: string;
  created_at: string;
}): ConceptScheme {
  return ConceptSchemeSchema.parse(rowToScheme(row));
}

export function conceptRowToConcept(row: {
  id: string;
  scheme_id: string;
  pref_label: string;
  notation: string | null;
  source: string | null;
  path: string | null;
  created_at: string;
}): Concept {
  return ConceptSchema.parse(rowToConcept(row));
}
