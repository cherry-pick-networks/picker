//  Report: response count vs pass count per actor (study time proxy).

import { getPg } from '#api/postgresql/pgClient.ts';
import { loadSql } from '#api/postgresql/sqlLoader.ts';

const sqlDir = new URL('../sql/', import.meta.url);
const SQL = await loadSql(sqlDir, 'study_time_roi.sql');

export interface StudyTimeRoiRow {
  actor_id: string;
  response_count: number;
  pass_count: number;
}

export async function getStudyTimeRoi(
  actorIds: string[],
  schemeId: string,
  from?: string,
  to?: string,
): Promise<StudyTimeRoiRow[]> {
  if (actorIds.length === 0) return [];
  const pg = await getPg();
  const r = await pg.queryObject<StudyTimeRoiRow>(SQL, [
    actorIds,
    schemeId,
    from ?? null,
    to ?? null,
  ]);
  return r.rows;
}
