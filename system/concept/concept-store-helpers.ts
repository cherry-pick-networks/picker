/**
 * Concept store helpers: tree, relation, bulk upsert. Keeps store under §P.
 */

import { getPg, withTx } from "#shared/infra/pg.client.ts";
import type {
  ConceptRelationRow,
  ConceptRow,
  ConceptUpsertRow,
} from "./concept.store.ts";

const SQL_SCHEME_TREE =
  "SELECT id, scheme_id, pref_label, notation, source, path::text, " +
  "created_at FROM concept WHERE scheme_id = $1 ORDER BY path NULLS LAST";
const SQL_RELATIONS_BY_SOURCE =
  "SELECT source_id, target_id, relation_type FROM concept_relation " +
  "WHERE source_id = $1 AND ($2::text IS NULL OR relation_type = $2)";
const SQL_UPSERT_CONCEPT =
  "INSERT INTO concept (id, scheme_id, pref_label, notation, source) " +
  "VALUES ($1, $2, $3, $4, $5) " +
  "ON CONFLICT (id) DO UPDATE SET " +
  "pref_label = EXCLUDED.pref_label, " +
  "notation = COALESCE(EXCLUDED.notation, concept.notation), " +
  "source = COALESCE(EXCLUDED.source, concept.source)";
const SQL_INSERT_RELATION =
  "INSERT INTO concept_relation (source_id, target_id, relation_type) " +
  "VALUES ($1, $2, $3) ON CONFLICT (source_id, target_id, relation_type) " +
  "DO NOTHING";

export { SQL_INSERT_RELATION, SQL_UPSERT_CONCEPT };

export async function getSchemeTreeRows(
  schemeId: string,
): Promise<ConceptRow[]> {
  const sql = await getPg();
  const { rows } = await sql.queryObject<ConceptRow>(SQL_SCHEME_TREE, [
    schemeId,
  ]);
  return rows;
}

export async function getRelationRowsBySource(
  sourceId: string,
  relationType?: string,
): Promise<ConceptRelationRow[]> {
  const sql = await getPg();
  const { rows } = await sql.queryObject<ConceptRelationRow>(
    SQL_RELATIONS_BY_SOURCE,
    [sourceId, relationType ?? null],
  );
  return rows;
}

/** Set of concept IDs that exist in the concept table. */
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

/** Upsert concepts and relations in one transaction (e.g. LLM ingestion). */
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
