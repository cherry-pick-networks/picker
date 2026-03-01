//  Item storage (Postgres): content_item table only.

import { getPg } from '#api/postgresql/connections/pgClient.ts';
import { loadSql } from '#api/postgresql/connections/sqlLoader.ts';

const sqlDir = new URL('./', import.meta.url);
const SQL_GET_ITEM = await loadSql(sqlDir, 'get_item.sql');
const SQL_SET_CONTENT_ITEM = await loadSql(
  sqlDir,
  'set_content_item.sql',
);
const SQL_LIST_ITEMS_BY_CONCEPT = await loadSql(
  sqlDir,
  'list_items_by_concept.sql',
);
const SQL_LIST_ITEMS_BY_SOURCE = await loadSql(
  sqlDir,
  'list_items_by_source.sql',
);
const SQL_COUNT_ITEMS_BY_SOURCE = await loadSql(
  sqlDir,
  'count_items_by_source.sql',
);

export async function getItem(
  id: string,
): Promise<unknown | null> {
  const pg = await getPg();
  const r = await pg.queryObject<{ payload: unknown }>(
    SQL_GET_ITEM,
    [id],
  );
  const row = r.rows[0];
  return row?.payload ?? null;
}

export async function setItem(
  value: Record<string, unknown>,
): Promise<void> {
  const id = value.item_id as string;
  if (!id) throw new Error('item_id required');
  const pg = await getPg();
  await pg.queryArray(SQL_SET_CONTENT_ITEM, [
    id,
    JSON.stringify(value),
  ]);
}

export async function listItemsByConcept(
  conceptId: string,
): Promise<Record<string, unknown>[]> {
  const pg = await getPg();
  const r = await pg.queryObject<{ payload: unknown }>(
    SQL_LIST_ITEMS_BY_CONCEPT,
    [conceptId],
  );
  return r.rows.map((row) => {
    const raw = row.payload;
    return (typeof raw === 'string'
      ? JSON.parse(raw)
      : raw) as Record<string, unknown>;
  });
}

export interface ItemRowBySource {
  id: string;
  payload: Record<string, unknown>;
}

export async function listItemsBySource(
  sourceId: string,
  limit: number,
): Promise<ItemRowBySource[]> {
  const pg = await getPg();
  const r = await pg.queryObject<
    { id: string; payload: unknown }
  >(
    SQL_LIST_ITEMS_BY_SOURCE,
    [sourceId, limit],
  );
  return r.rows.map((row) => ({
    id: row.id,
    payload:
      (typeof row.payload === 'string'
        ? JSON.parse(row.payload)
        : row.payload) as Record<string, unknown>,
  }));
}

export async function countItemsBySource(
  sourceId: string,
): Promise<number> {
  const pg = await getPg();
  const r = await pg.queryObject<{ total: number }>(
    SQL_COUNT_ITEMS_BY_SOURCE,
    [sourceId],
  );
  return r.rows[0]?.total ?? 0;
}
