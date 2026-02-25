/**
 * Concept service. Validation: facet IDs per scheme, 500 cap.
 */

import * as store from "./concept.store.ts";
import {
  type Concept,
  conceptRowToConcept,
  type ConceptScheme,
  schemeRowToScheme,
} from "./concept.schema.ts";

const FACET_ID_LIMIT = 500;
const ERROR_FACET_ID_LIMIT = "ID count exceeds limit of 500";
const ERROR_INVALID_IDS_FOR_SCHEME = "Invalid IDs for scheme: ";

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

/** Facet IDs must belong to allowedScheme; bulk capped at 500. */
export async function validateFacetSchemes(
  ids: string[],
  allowedScheme: string,
): Promise<void> {
  if (ids.length > FACET_ID_LIMIT) throw new Error(ERROR_FACET_ID_LIMIT);
  const valid = await store.checkIdsInScheme(ids, allowedScheme);
  if (!valid) {
    throw new Error(ERROR_INVALID_IDS_FOR_SCHEME + allowedScheme);
  }
}
