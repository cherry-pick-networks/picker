/**
 * Concept scheme and concept store. PostgreSQL via shared/infra pg client.
 * Tables: concept_scheme, concept, concept_relation (see shared/infra/schema/).
 */

import { getPg, withTx } from "#shared/infra/pg.client.ts";

const SQL_LIST_SCHEMES =
  "SELECT id, pref_label, created_at FROM concept_scheme ORDER BY id";
const SQL_GET_SCHEME =
  "SELECT id, pref_label, created_at FROM concept_scheme WHERE id = $1";
const SQL_LIST_CONCEPTS_BY_SCHEME =
  "SELECT id, scheme_id, pref_label, notation, source, path::text, created_at " +
  "FROM concept WHERE scheme_id = $1 ORDER BY id";
const SQL_GET_CONCEPT =
  "SELECT id, scheme_id, pref_label, notation, source, path::text, created_at " +
  "FROM concept WHERE id = $1";
const SQL_UPSERT_CONCEPT =
  "INSERT INTO concept (id, scheme_id, pref_label, notation, source) " +
  "VALUES ($1, $2, $3, $4, $5) " +
  "ON CONFLICT (id) DO UPDATE SET " +
  "pref_label = EXCLUDED.pref_label, " +
  "notation = COALESCE(EXCLUDED.notation, concept.notation), " +
  "source = COALESCE(EXCLUDED.source, concept.source)";
const SQL_INSERT_RELATION =
  "INSERT INTO concept_relation (source_id, target_id, relation_type) " +
  "VALUES ($1, $2, $3) ON CONFLICT (source_id, target_id, relation_type) DO NOTHING";

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

export async function getConceptRow(id: string): Promise<ConceptRow | null> {
  const sql = await getPg();
  const { rows } = await sql.queryObject<ConceptRow>(SQL_GET_CONCEPT, [id]);
  return rows.length === 0 ? null : rows[0];
}

/** Returns the set of concept IDs that exist in the concept table. */
export async function getExistingConceptIds(
  ids: string[],
): Promise<Set<string>> {
  if (ids.length === 0) return new Set();
  const sql = await getPg();
  const { rows } = await sql.queryObject<{ id: string }>(
    "SELECT id FROM concept WHERE id = ANY($1::text[])",
    [ids],
  );
  return new Set(rows.map((r) => r.id));
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

/** Upsert concepts and insert relations in one transaction (e.g. LLM ingestion). */
// function-length-ignore
export async function upsertConceptsAndRelations(
  concepts: ConceptUpsertRow[],
  relations: ConceptRelationRow[],
): Promise<void> {
  await withTx(async (sql) => {
    for (const row of concepts) {
      await sql.queryObject(SQL_UPSERT_CONCEPT, [
        row.id,
        row.scheme_id,
        row.pref_label,
        row.notation ?? null,
        row.source ?? null,
      ]);
    }
    for (const row of relations) {
      await sql.queryObject(SQL_INSERT_RELATION, [
        row.source_id,
        row.target_id,
        row.relation_type,
      ]);
    }
  });
}
