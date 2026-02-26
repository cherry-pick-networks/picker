/** Actor profile and progress storage (Postgres). */

import { getPg } from "#shared/infra/pg.client.ts";

export async function getProfile(id: string): Promise<unknown | null> {
  const pg = await getPg();
  const r = await pg.queryObject<{ payload: unknown }>(
    "SELECT payload FROM actor_profile WHERE id = $1",
    [id],
  );
  const row = r.rows[0];
  return row?.payload ?? null;
}

export async function setProfile(id: string, value: unknown): Promise<void> {
  const pg = await getPg();
  await pg.queryArray(
    `INSERT INTO actor_profile (id, payload, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (id) DO UPDATE SET payload = $2, updated_at = now()`,
    [id, JSON.stringify(value)],
  );
}

export async function getProgress(id: string): Promise<unknown | null> {
  const pg = await getPg();
  const r = await pg.queryObject<{ payload: unknown }>(
    "SELECT payload FROM actor_progress WHERE id = $1",
    [id],
  );
  const row = r.rows[0];
  return row?.payload ?? null;
}

export async function setProgress(id: string, value: unknown): Promise<void> {
  const pg = await getPg();
  await pg.queryArray(
    `INSERT INTO actor_progress (id, payload, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (id) DO UPDATE SET payload = $2, updated_at = now()`,
    [id, JSON.stringify(value)],
  );
}
