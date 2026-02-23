/**
 * Concept scheme and concept service. Read-only for Scope 2.
 */

import * as store from "./concept.store.ts";
import {
  conceptRowToConcept,
  schemeRowToScheme,
  type Concept,
  type ConceptRelation,
  type ConceptScheme,
} from "./concept.schema.ts";

export type {
  Concept,
  ConceptRelation,
  ConceptScheme,
} from "./concept.schema.ts";

export async function listSchemes(): Promise<ConceptScheme[]> {
  const rows = await store.listSchemeRows();
  return rows.map(schemeRowToScheme);
}

export async function getScheme(id: string): Promise<ConceptScheme | null> {
  const row = await store.getSchemeRow(id);
  return row == null ? null : schemeRowToScheme(row);
}

export async function listConceptsByScheme(
  schemeId: string,
): Promise<Concept[]> {
  const rows = await store.listConceptRowsByScheme(schemeId);
  return rows.map(conceptRowToConcept);
}

export async function getConcept(id: string): Promise<Concept | null> {
  const row = await store.getConceptRow(id);
  return row == null ? null : conceptRowToConcept(row);
}

/** IDs not in concept table (hallucination mitigation). */
export async function validateConceptIds(
  ids: string[],
): Promise<{ invalid: string[] }> {
  const existing = await store.getExistingConceptIds(ids);
  const invalid = ids.filter((id) => !existing.has(id));
  return { invalid };
}

/** Full concept hierarchy for scheme (path-ordered). Null if scheme missing. */
export async function getTree(
  schemeId: string,
): Promise<{ concepts: Concept[] } | null> {
  const scheme = await store.getSchemeRow(schemeId);
  if (scheme == null) return null;
  const rows = await store.getSchemeTreeRows(schemeId);
  return { concepts: rows.map(conceptRowToConcept) };
}

/** Dependencies (outgoing relations) for concept. Null if concept missing. */
export async function getDependencies(
  conceptId: string,
  relationType?: string,
): Promise<{ dependencies: ConceptRelation[] } | null> {
  const concept = await store.getConceptRow(conceptId);
  if (concept == null) return null;
  const rows = await store.getRelationRowsBySource(conceptId, relationType);
  return {
    dependencies: rows.map((r) => ({
      sourceId: r.source_id,
      targetId: r.target_id,
      relationType: r.relation_type,
    })),
  };
}
