/**
 * Concept scheme and concept store. PostgreSQL via shared/infra pg client.
 * Tables: concept_scheme, concept, concept_relation (shared/infra/schema/).
 */

import { getPg } from "#shared/infra/pg.client.ts";
import type { ConceptRow, ConceptSchemeRow } from "./concept.schema.ts";

const SQL_LIST_SCHEMES =
  "SELECT id, pref_label, created_at FROM concept_scheme ORDER BY id";
const SQL_GET_SCHEME =
  "SELECT id, pref_label, created_at FROM concept_scheme WHERE id = $1";
const SQL_LIST_CONCEPTS_BY_SCHEME =
  "SELECT id, scheme_id, pref_label, notation, source, path::text, " +
  "created_at FROM concept WHERE scheme_id = $1 ORDER BY id";
const SQL_GET_CONCEPT =
  "SELECT id, scheme_id, pref_label, notation, source, path::text, " +
  "created_at FROM concept WHERE id = $1";
const SQL_EXISTING_IDS = "SELECT id FROM concept WHERE id = ANY($1::text[])";
const SQL_IDS_IN_SCHEME =
  "SELECT id FROM concept WHERE id = ANY($1::text[]) AND scheme_id = $2";

export async function listSchemeRows(): Promise<ConceptSchemeRow[]> {
  const sql = await getPg();
  const { rows } = await sql.queryObject<ConceptSchemeRow>(SQL_LIST_SCHEMES);
  return rows;
}

export async function getSchemeRow(
  id: string,
): Promise<ConceptSchemeRow | null> {
  const sql = await getPg();
  const { rows } = await sql.queryObject<ConceptSchemeRow>(SQL_GET_SCHEME, [
    id,
  ]);
  return rows.length === 0 ? null : rows[0];
}

export async function listConceptRowsByScheme(
  schemeId: string,
): Promise<ConceptRow[]> {
  const sql = await getPg();
  const { rows } = await sql.queryObject<ConceptRow>(
    SQL_LIST_CONCEPTS_BY_SCHEME,
    [schemeId],
  );
  return rows;
}

export async function getConceptRow(id: string): Promise<ConceptRow | null> {
  const sql = await getPg();
  const { rows } = await sql.queryObject<ConceptRow>(SQL_GET_CONCEPT, [id]);
  return rows.length === 0 ? null : rows[0];
}

export async function getExistingConceptIds(
  ids: string[],
): Promise<Set<string>> {
  if (ids.length === 0) return new Set();
  const sql = await getPg();
  const { rows } = await sql.queryObject<{ id: string }>(
    SQL_EXISTING_IDS,
    [ids],
  );
  return new Set(rows.map((r) => r.id));
}

function idsMatchScheme(ids: string[], rows: { id: string }[]): boolean {
  const found = new Set(rows.map((r) => r.id));
  const unique = [...new Set(ids)];
  return unique.length === found.size && unique.every((id) => found.has(id));
}

/** True iff every id in ids exists in concept and has scheme_id = schemeId. */
export async function checkIdsInScheme(
  ids: string[],
  schemeId: string,
): Promise<boolean> {
  if (ids.length === 0) return true;
  const sql = await getPg();
  const { rows } = await sql.queryObject<{ id: string }>(
    SQL_IDS_IN_SCHEME,
    [ids, schemeId],
  );
  return idsMatchScheme(ids, rows);
}
