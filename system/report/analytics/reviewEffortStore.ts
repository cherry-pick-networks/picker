//  Report: review count (schedule engagement proxy).

import { getPg } from '#system/infra/pgClient.ts';
import { loadSql } from '#system/infra/sqlLoader.ts';

const sqlDir = new URL('../sql/', import.meta.url);
const SQL = await loadSql(sqlDir, 'review_effort.sql');

export async function getReviewCount(
  actorId: string,
  from?: string,
  to?: string,
): Promise<number> {
  const pg = await getPg();
  const r = await pg.queryObject<{ review_count: number }>(
    SQL,
    [
      actorId,
      from ?? null,
      to ?? null,
    ],
  );
  return r.rows[0]?.review_count ?? 0;
}
