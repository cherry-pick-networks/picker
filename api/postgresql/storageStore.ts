//  Generic key-value storage (Postgres). Logical key only (e.g. "foo").

import { getPg } from '#api/postgresql/pgClient.ts';
import { loadSql } from '#api/postgresql/sqlLoader.ts';

const sqlDir = new URL('./key_vault/', import.meta.url);
const SQL_LIST_KEYS_BY_PREFIX = await loadSql(
  sqlDir,
  'list_keys_by_prefix.sql',
);
const SQL_LIST_KEYS = await loadSql(
  sqlDir,
  'list_keys.sql',
);
const SQL_GET_KEY = await loadSql(sqlDir, 'get_key.sql');
const SQL_SET_KEY = await loadSql(sqlDir, 'set_key.sql');
const SQL_DELETE_KEY = await loadSql(
  sqlDir,
  'delete_key.sql',
);

export async function listKeys(
  prefix?: string,
): Promise<string[]> {
  const pg = await getPg();
  const [sql, args] = prefix
    ? [SQL_LIST_KEYS_BY_PREFIX, [prefix + '%'] as string[]]
    : [SQL_LIST_KEYS, [] as string[]];
  const r = await pg.queryObject<{ logical_key: string }>(
    sql,
    args,
  );
  return r.rows.map((row) => row.logical_key);
}

export async function getKey(
  logicalKey: string,
): Promise<unknown | null> {
  const pg = await getPg();
  const r = await pg.queryObject<{ value: unknown }>(
    SQL_GET_KEY,
    [
      logicalKey,
    ],
  );
  const row = r.rows[0];
  return row?.value ?? null;
}

export async function setKey(
  logicalKey: string,
  value: unknown,
): Promise<void> {
  const pg = await getPg();
  await pg.queryArray(SQL_SET_KEY, [
    logicalKey,
    JSON.stringify(value),
  ]);
}

export async function deleteKey(
  logicalKey: string,
): Promise<void> {
  const pg = await getPg();
  await pg.queryArray(SQL_DELETE_KEY, [logicalKey]);
}
