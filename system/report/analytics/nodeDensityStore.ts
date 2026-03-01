//  Report: outcome count per concept (node density).

import { getPg } from '#system/infra/pgClient.ts';
import { loadSql } from '#system/infra/sqlLoader.ts';

const sqlDir = new URL('../sql/', import.meta.url);
const SQL = await loadSql(sqlDir, 'node_density.sql');

export interface NodeDensityRow {
  code: string;
  outcome_count: number;
}

export async function getNodeDensity(
  schemeId: string,
  from?: string,
  to?: string,
): Promise<NodeDensityRow[]> {
  const pg = await getPg();
  const r = await pg.queryObject<NodeDensityRow>(SQL, [
    schemeId,
    from ?? null,
    to ?? null,
  ]);
  return r.rows;
}
