//  Report: daily mastery (pass rate over time).

import { getPg } from '#api/postgresql/connections/pgClient.ts';
import { loadSql } from '#api/postgresql/connections/sqlLoader.ts';

const sqlDir = new URL('../sql/', import.meta.url);
const SQL = await loadSql(sqlDir, 'mastery_trajectory.sql');

export interface MasteryTrajectoryRow {
  day: string;
  pass_count: number;
  total: number;
}

export async function getMasteryTrajectory(
  actorId: string,
  schemeId: string,
  from?: string,
  to?: string,
): Promise<MasteryTrajectoryRow[]> {
  const pg = await getPg();
  const r = await pg.queryObject<MasteryTrajectoryRow>(
    SQL,
    [
      actorId,
      schemeId,
      from ?? null,
      to ?? null,
    ],
  );
  return r.rows;
}
