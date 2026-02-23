/**
 * Source storage in PostgreSQL. Table: source (source_id, payload, updated_at).
 */

import { getPg } from "#shared/infra/pg.client.ts";

const SQL_GET =
  "SELECT payload FROM source WHERE source_id = $1";
const SQL_UPSERT =
  "INSERT INTO source (source_id, payload, updated_at) VALUES ($1, $2, $3) " +
  "ON CONFLICT (source_id) DO UPDATE SET payload = EXCLUDED.payload, " +
  "updated_at = EXCLUDED.updated_at";
const SQL_LIST = "SELECT source_id, payload, updated_at FROM source ORDER BY source_id";

export async function getSource(id: string): Promise<unknown | null> {
  const sql = await getPg();
  const { rows } = await sql.queryObject<{ payload: unknown }>(SQL_GET, [id]);
  if (rows.length === 0) return null;
  return rows[0].payload ?? null;
}

export async function setSource(
  value: Record<string, unknown>,
): Promise<void> {
  const id = value.source_id as string;
  if (!id) throw new Error("source_id required");
  const sql = await getPg();
  const updatedAt = new Date().toISOString();
  await sql.queryObject(SQL_UPSERT, [id, JSON.stringify(value), updatedAt]);
}

export async function listSources(): Promise<Record<string, unknown>[]> {
  const sql = await getPg();
  const { rows } = await sql.queryObject<{ payload: unknown }>(SQL_LIST);
  return rows
    .map((r) => r.payload as Record<string, unknown> | null)
    .filter((v): v is Record<string, unknown> => v != null);
}
