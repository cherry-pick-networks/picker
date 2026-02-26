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
