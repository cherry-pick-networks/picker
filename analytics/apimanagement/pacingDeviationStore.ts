//  Report: first outcome per concept (pacing deviation actual).

import { getPg } from '#api/postgresql/pgClient.ts';
import { loadSql } from '#api/postgresql/sqlLoader.ts';

const sqlDir = new URL('../sql/', import.meta.url);
const SQL = await loadSql(sqlDir, 'pacing_deviation.sql');

export interface PacingDeviationRow {
  code: string;
  first_at: Date;
}

export async function getPacingDeviation(
  actorId: string,
  schemeId: string,
  from?: string,
  to?: string,
): Promise<PacingDeviationRow[]> {
  const pg = await getPg();
  const r = await pg.queryObject<PacingDeviationRow>(SQL, [
    actorId,
    schemeId,
    from ?? null,
    to ?? null,
  ]);
  return r.rows;
}
