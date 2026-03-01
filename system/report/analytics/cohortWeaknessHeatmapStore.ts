//  Report: cohort weakness heatmap rows (concept × actor pass rate).

import { getPg } from '#system/infra/pgClient.ts';
import { loadSql } from '#system/infra/sqlLoader.ts';

const sqlDir = new URL('../sql/', import.meta.url);
const SQL = await loadSql(
  sqlDir,
  'cohort_weakness_heatmap.sql',
);

export interface HeatmapRow {
  actor_id: string;
  code: string;
  pass_count: number;
  total: number;
}

export async function getCohortWeaknessHeatmap(
  actorIds: string[],
  schemeId: string,
  from?: string,
  to?: string,
): Promise<HeatmapRow[]> {
  if (actorIds.length === 0) return [];
  const pg = await getPg();
  const r = await pg.queryObject<HeatmapRow>(SQL, [
    actorIds,
    schemeId,
    from ?? null,
    to ?? null,
  ]);
  return r.rows;
}
