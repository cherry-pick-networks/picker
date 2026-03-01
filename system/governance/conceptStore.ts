//  Concept storage (Postgres): scheme and concept tables.

import { getPg } from '#system/infra/pgClient.ts';
import { loadSql } from '#system/infra/sqlLoader.ts';

const sqlDir = new URL('./sql/', import.meta.url);
const SQL_CHECK_IDS_IN_SCHEME = await loadSql(
  sqlDir,
  'check_ids_in_scheme.sql',
);
const SQL_GET_EXISTING_CONCEPT_IDS = await loadSql(
  sqlDir,
  'get_existing_concept_ids_by_schemes.sql',
);
const SQL_GET_CONCEPT_PREF_LABELS = await loadSql(
  sqlDir,
  'get_concept_pref_labels.sql',
);

export async function checkIdsInScheme(
  ids: string[],
  schemeId: string,
): Promise<boolean> {
  if (ids.length === 0) return true;
  const pg = await getPg();
  const r = await pg.queryObject<{ code: string }>(
    SQL_CHECK_IDS_IN_SCHEME,
    [schemeId, ids],
  );
  return ids.every((id) =>
    r.rows.some((row) => row.code === id)
  );
}

export async function getExistingConceptIdsBySchemes(
  ids: string[],
  allowedSchemeIds: string[],
): Promise<Set<string>> {
  if (ids.length === 0 || allowedSchemeIds.length === 0) {
    return new Set();
  }
  const pg = await getPg();
  const r = await pg.queryObject<{ code: string }>(
    SQL_GET_EXISTING_CONCEPT_IDS,
    [ids, allowedSchemeIds],
  );
  return new Set(r.rows.map((row) => row.code));
}

export async function getConceptPrefLabels(
  codes: string[],
): Promise<Map<string, string>> {
  if (codes.length === 0) return new Map();
  const pg = await getPg();
  const r = await pg.queryObject<
    { code: string; pref_label: string }
  >(
    SQL_GET_CONCEPT_PREF_LABELS,
    [codes],
  );
  return new Map(
    r.rows.map((row) => [row.code, row.pref_label]),
  );
}

export {
  getNeighborConceptCodes,
  getRequiresPredecessors,
  getRequiresSuccessors,
} from './conceptStoreRelations.ts';
export { loadAllowlistData } from './conceptStoreAllowlist.ts';
