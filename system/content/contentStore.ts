/** Content storage (Postgres): items and worksheets. */

import { getPg } from '#shared/infra/pgClient.ts';
import { loadSql } from '#shared/infra/sqlLoader.ts';

const sqlDir = new URL('./sql/', import.meta.url);
const SQL_GET_ITEM = await loadSql(sqlDir, 'get_item.sql');
const SQL_SET_CONTENT_ITEM = await loadSql(sqlDir, 'set_content_item.sql');
const SQL_LIST_ITEMS_BY_CONCEPT = await loadSql(
  sqlDir,
  'list_items_by_concept.sql',
);
const SQL_GET_WORKSHEET = await loadSql(sqlDir, 'get_worksheet.sql');
const SQL_SET_WORKSHEET = await loadSql(sqlDir, 'set_worksheet.sql');

export async function getItem(id: string): Promise<unknown | null> {
  const pg = await getPg();
  const r = await pg.queryObject<{ payload: unknown }>(SQL_GET_ITEM, [id]);
  const row = r.rows[0];
  return row?.payload ?? null;
}

export async function setItem(value: Record<string, unknown>): Promise<void> {
  const id = value.item_id as string;
  if (!id) throw new Error('item_id required');
  const pg = await getPg();
  await pg.queryArray(SQL_SET_CONTENT_ITEM, [id, JSON.stringify(value)]);
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
    return (typeof raw === 'string' ? JSON.parse(raw) : raw) as Record<
      string,
      unknown
    >;
  });
}

export async function getWorksheet(id: string): Promise<unknown | null> {
  const pg = await getPg();
  const r = await pg.queryObject<{ payload: unknown }>(SQL_GET_WORKSHEET, [
    id,
  ]);
  const row = r.rows[0];
  return row?.payload ?? null;
}

export async function setWorksheet(
  value: Record<string, unknown>,
): Promise<void> {
  const id = value.worksheet_id as string;
  if (!id) throw new Error('worksheet_id required');
  const pg = await getPg();
  await pg.queryArray(SQL_SET_WORKSHEET, [id, JSON.stringify(value)]);
}
