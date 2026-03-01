//  Source storage (Postgres).

import { getPg } from '#api/postgresql/connections/pgClient.ts';
import { loadSql } from '#api/postgresql/connections/sqlLoader.ts';

const sqlDir = new URL('../sql/', import.meta.url);
const SQL_GET_SOURCE = await loadSql(
  sqlDir,
  'get_source.sql',
);
const SQL_SET_SOURCE = await loadSql(
  sqlDir,
  'set_source.sql',
);
const SQL_LIST_SOURCES = await loadSql(
  sqlDir,
  'list_sources.sql',
);

export async function getSource(
  id: string,
): Promise<unknown | null> {
  const pg = await getPg();
  const r = await pg.queryObject<{ payload: unknown }>(
    SQL_GET_SOURCE,
    [id],
  );
  const row = r.rows[0];
  return row?.payload ?? null;
}

export async function setSource(
  value: Record<string, unknown>,
): Promise<void> {
  const id = value.source_id as string;
  if (!id) throw new Error('source_id required');
  const pg = await getPg();
  await pg.queryArray(SQL_SET_SOURCE, [
    id,
    JSON.stringify(value),
  ]);
}

export async function listSources(): Promise<
  Record<string, unknown>[]
> {
  const pg = await getPg();
  const r = await pg.queryObject<{ payload: unknown }>(
    SQL_LIST_SOURCES,
  );
  return r.rows.map((row) => {
    const raw = row.payload;
    return (typeof raw === 'string'
      ? JSON.parse(raw)
      : raw) as Record<
        string,
        unknown
      >;
  });
}
