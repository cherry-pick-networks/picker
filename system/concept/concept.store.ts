/** Concept storage (Postgres): scheme and concept tables. */

import { getPg } from "#shared/infra/pg.client.ts";

export async function checkIdsInScheme(
  ids: string[],
  schemeId: string,
): Promise<boolean> {
  if (ids.length === 0) return true;
  const pg = await getPg();
  const r = await pg.queryObject<{ code: string }>(
    "SELECT code FROM concept WHERE scheme_id = $1 AND code = ANY($2)",
    [schemeId, ids],
  );
  return ids.every((id) => r.rows.some((row) => row.code === id));
}

export async function getExistingConceptIdsBySchemes(
  ids: string[],
  allowedSchemeIds: string[],
): Promise<Set<string>> {
  if (ids.length === 0 || allowedSchemeIds.length === 0) return new Set();
  const pg = await getPg();
  const r = await pg.queryObject<{ code: string }>(
    "SELECT code FROM concept WHERE code = ANY($1) AND scheme_id = ANY($2)",
    [ids, allowedSchemeIds],
  );
  return new Set(r.rows.map((row) => row.code));
}
