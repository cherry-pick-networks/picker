/** Content storage (Postgres): items and worksheets. */

import { getPg } from "#shared/infra/pg.client.ts";

export async function getItem(id: string): Promise<unknown | null> {
  const pg = await getPg();
  const r = await pg.queryObject<{ payload: unknown }>(
    "SELECT payload FROM content_item WHERE id = $1",
    [id],
  );
  const row = r.rows[0];
  return row?.payload ?? null;
}

export async function setItem(value: Record<string, unknown>): Promise<void> {
  const id = value.item_id as string;
  if (!id) throw new Error("item_id required");
  const pg = await getPg();
  await pg.queryArray(
    `INSERT INTO content_item (id, payload, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (id) DO UPDATE SET payload = $2, updated_at = now()`,
    [id, JSON.stringify(value)],
  );
}

export async function listItemsByConcept(
  conceptId: string,
): Promise<Record<string, unknown>[]> {
  const pg = await getPg();
  const r = await pg.queryObject<{ payload: unknown }>(
    "SELECT payload FROM content_item WHERE payload->>'concept_id' = $1",
    [conceptId],
  );
  return r.rows.map((row) => {
    const raw = row.payload;
    return (typeof raw === "string" ? JSON.parse(raw) : raw) as Record<
      string,
      unknown
    >;
  });
}

export async function getWorksheet(id: string): Promise<unknown | null> {
  const pg = await getPg();
  const r = await pg.queryObject<{ payload: unknown }>(
    "SELECT payload FROM content_worksheet WHERE id = $1",
    [id],
  );
  const row = r.rows[0];
  return row?.payload ?? null;
}

export async function setWorksheet(
  value: Record<string, unknown>,
): Promise<void> {
  const id = value.worksheet_id as string;
  if (!id) throw new Error("worksheet_id required");
  const pg = await getPg();
  await pg.queryArray(
    `INSERT INTO content_worksheet (id, payload, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (id) DO UPDATE SET payload = $2, updated_at = now()`,
    [id, JSON.stringify(value)],
  );
}
