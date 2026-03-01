//  Report: item responses for discrimination index.

import { getPg } from '#api/postgresql/pgClient.ts';
import { loadSql } from '#api/postgresql/sqlLoader.ts';

const sqlDir = new URL('../sql/', import.meta.url);
const SQL = await loadSql(
  sqlDir,
  'item_responses_for_discrimination.sql',
);

export interface ItemResponseRow {
  item_id: string;
  actor_id: string;
  correct: boolean;
}

export async function listItemResponsesForDiscrimination(
  from?: string,
  to?: string,
): Promise<ItemResponseRow[]> {
  const pg = await getPg();
  const r = await pg.queryObject<ItemResponseRow>(SQL, [
    null,
    from ?? null,
    to ?? null,
  ]);
  return r.rows;
}
