/**
 * KV store backed by PostgreSQL. Table: kv(logical_key, value JSONB).
 */

import { getPg } from "#shared/infra/pg.client.ts";

const SQL_LIST = "SELECT logical_key FROM kv";
const SQL_LIST_PREFIX = "SELECT logical_key FROM kv WHERE logical_key LIKE $1";
const SQL_GET = "SELECT value FROM kv WHERE logical_key = $1";
const SQL_SET =
  "INSERT INTO kv (logical_key, value) VALUES ($1, $2) " +
  "ON CONFLICT (logical_key) DO UPDATE SET value = EXCLUDED.value";
const SQL_DELETE = "DELETE FROM kv WHERE logical_key = $1";

export async function listKeys(prefix?: string): Promise<string[]> {
  const sql = await getPg();
  if (prefix === undefined) {
    const { rows } = await sql.queryObject<{ logical_key: string }>(SQL_LIST);
    return rows.map((r) => r.logical_key);
  }
  const pattern = `${prefix}%`;
  const { rows } = await sql.queryObject<{ logical_key: string }>(
    SQL_LIST_PREFIX,
    [pattern],
  );
  return rows.map((r) => r.logical_key);
}

export async function getKey(logicalKey: string): Promise<unknown | null> {
  const sql = await getPg();
  const { rows } = await sql.queryObject<{ value: unknown }>(SQL_GET, [
    logicalKey,
  ]);
  if (rows.length === 0) return null;
  return rows[0].value ?? null;
}

export async function setKey(
  logicalKey: string,
  value: unknown,
): Promise<void> {
  const sql = await getPg();
  await sql.queryObject(SQL_SET, [logicalKey, JSON.stringify(value)]);
}

export async function deleteKey(logicalKey: string): Promise<void> {
  const sql = await getPg();
  await sql.queryObject(SQL_DELETE, [logicalKey]);
}
