/**
 * Concept scheme and concept store. PostgreSQL via shared/infra pg client.
 * Tables: concept_scheme, concept, concept_relation (see shared/infra/schema/).
 */

import { getPg } from "#shared/infra/pg.client.ts";
import {
  SQL_INSERT_RELATION,
  SQL_UPSERT_CONCEPT,
} from "./concept-store-helpers.ts";

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

export type ConceptSchemeRow = {
  id: string;
  pref_label: string;
  created_at: string;
};

export type ConceptRow = {
  id: string;
  scheme_id: string;
  pref_label: string;
  notation: string | null;
  source: string | null;
  path: string | null;
  created_at: string;
};

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

export {
  getExistingConceptIds,
  getRelationRowsBySource,
  getSchemeTreeRows,
  upsertConceptsAndRelations,
} from "./concept-store-helpers.ts";

export async function getConceptRow(id: string): Promise<ConceptRow | null> {
  const sql = await getPg();
  const { rows } = await sql.queryObject<ConceptRow>(SQL_GET_CONCEPT, [id]);
  return rows.length === 0 ? null : rows[0];
}

export type ConceptUpsertRow = {
  id: string;
  scheme_id: string;
  pref_label: string;
  notation?: string | null;
  source?: string | null;
};

export async function upsertConceptRow(row: ConceptUpsertRow): Promise<void> {
  const sql = await getPg();
  await sql.queryObject(SQL_UPSERT_CONCEPT, [
    row.id,
    row.scheme_id,
    row.pref_label,
    row.notation ?? null,
    row.source ?? null,
  ]);
}

export type ConceptRelationRow = {
  source_id: string;
  target_id: string;
  relation_type: string;
};

export async function insertConceptRelationIfNotExists(
  row: ConceptRelationRow,
): Promise<void> {
  const sql = await getPg();
  await sql.queryObject(SQL_INSERT_RELATION, [
    row.source_id,
    row.target_id,
    row.relation_type,
  ]);
}
