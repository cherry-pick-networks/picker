/**
 * Content store query helpers. SELECTs for listItemsByConcept etc.
 */

import type { Sql } from "#shared/infra/pg.types.ts";

const SQL_ITEMS_BY_CONCEPT =
  "SELECT payload FROM content_item WHERE concept_id = $1";

export async function selectItemsByConcept(
  sql: Sql,
  conceptId: string,
): Promise<Record<string, unknown>[]> {
  const { rows } = await sql.queryObject<{ payload: unknown }>(
    SQL_ITEMS_BY_CONCEPT,
    [conceptId],
  );
  return rows
    .map((r) => r.payload as Record<string, unknown> | null)
    .filter((v): v is Record<string, unknown> => v != null);
}
