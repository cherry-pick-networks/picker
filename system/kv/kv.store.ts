/** Generic key-value storage (Postgres). Logical key only (e.g. "foo"). */

import { getPg } from "#shared/infra/pg.client.ts";

export async function listKeys(prefix?: string): Promise<string[]> {
  const pg = await getPg();
  const r = prefix
    ? await pg.queryObject<{ logical_key: string }>(
      "SELECT logical_key FROM kv WHERE logical_key LIKE $1 " +
        "ORDER BY logical_key",
      [prefix + "%"],
    )
    : await pg.queryObject<{ logical_key: string }>(
      "SELECT logical_key FROM kv ORDER BY logical_key",
    );
  return r.rows.map((row) => row.logical_key);
}

export async function getKey(logicalKey: string): Promise<unknown | null> {
  const pg = await getPg();
  const r = await pg.queryObject<{ value: unknown }>(
    "SELECT value FROM kv WHERE logical_key = $1",
    [logicalKey],
  );
  const row = r.rows[0];
  return row?.value ?? null;
}

export async function setKey(
  logicalKey: string,
  value: unknown,
): Promise<void> {
  const pg = await getPg();
  await pg.queryArray(
    `INSERT INTO kv (logical_key, value) VALUES ($1, $2)
     ON CONFLICT (logical_key) DO UPDATE SET value = $2`,
    [logicalKey, JSON.stringify(value)],
  );
}

export async function deleteKey(logicalKey: string): Promise<void> {
  const pg = await getPg();
  await pg.queryArray("DELETE FROM kv WHERE logical_key = $1", [logicalKey]);
}
