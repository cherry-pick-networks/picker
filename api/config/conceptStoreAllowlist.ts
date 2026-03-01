//
// Allowlist data loading from concept tables. Used by conceptStore.loadAllowlistData.
//

import type { AllowlistData } from '#api/config/allowlistTypes.ts';
import { getPg } from '#api/postgresql/connections/pgClient.ts';
import { loadSql } from '#api/postgresql/connections/sqlLoader.ts';

import {
  buildAllowlistResult,
  createEmptyAllowlistSets,
  fillSetsFromRows,
  getSchemeIdSets,
} from './conceptStoreAllowlistSets.ts';

const sqlDir = new URL('./sql/', import.meta.url);
const SQL_LIST_CONCEPT_CODES_BY_SCHEME = await loadSql(
  sqlDir,
  'list_concept_codes_by_scheme.sql',
);

async function getAllowlistRows(): Promise<
  { scheme_id: string; code: string }[]
> {
  const pg = await getPg();
  const r = await pg.queryObject<
    { scheme_id: string; code: string }
  >(
    SQL_LIST_CONCEPT_CODES_BY_SCHEME,
  );
  return r.rows;
}

export async function loadAllowlistData(): Promise<
  AllowlistData
> {
  const rows = await getAllowlistRows();
  const sets = createEmptyAllowlistSets();
  fillSetsFromRows(rows, sets, getSchemeIdSets());
  return buildAllowlistResult(sets);
}
