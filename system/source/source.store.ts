/** Source storage (Postgres). */

import { getPg } from "#shared/infra/pg.client.ts";

export async function getSource(id: string): Promise<unknown | null> {
  const pg = await getPg();
  const r = await pg.queryObject<{ payload: unknown }>(
    "SELECT payload FROM source WHERE source_id = $1",
    [id],
  );
  const row = r.rows[0];
  return row?.payload ?? null;
}

export async function setSource(
  value: Record<string, unknown>,
): Promise<void> {
  const id = value.source_id as string;
  if (!id) throw new Error("source_id required");
  const pg = await getPg();
  await pg.queryArray(
    `INSERT INTO source (source_id, payload, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (source_id) DO UPDATE SET payload = $2, updated_at = now()`,
    [id, JSON.stringify(value)],
  );
}

export async function listSources(): Promise<Record<string, unknown>[]> {
  const pg = await getPg();
  const r = await pg.queryObject<{ payload: unknown }>(
    "SELECT payload FROM source ORDER BY source_id",
  );
  return r.rows.map((row) => {
    const raw = row.payload;
    return (typeof raw === "string" ? JSON.parse(raw) : raw) as Record<
      string,
      unknown
    >;
  });
}
