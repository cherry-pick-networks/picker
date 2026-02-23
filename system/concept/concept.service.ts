/**
 * Concept scheme and concept service. Read-only for Scope 2.
 */

import * as store from "./concept.store.ts";
import {
  conceptRowToConcept,
  schemeRowToScheme,
  type Concept,
  type ConceptScheme,
} from "./concept.schema.ts";

export type { Concept, ConceptScheme } from "./concept.schema.ts";

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

/** Returns IDs that are not present in the concept table (hallucination mitigation). */
export async function validateConceptIds(
  ids: string[],
): Promise<{ invalid: string[] }> {
  const existing = await store.getExistingConceptIds(ids);
  const invalid = ids.filter((id) => !existing.has(id));
  return { invalid };
}
