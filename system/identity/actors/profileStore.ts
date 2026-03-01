//  Actor profile and progress storage (Postgres).

import { getPg } from '#system/infra/pgClient.ts';
import { loadSql } from '#system/infra/sqlLoader.ts';

const sqlDir = new URL('../sql/', import.meta.url);
const SQL_GET_PROFILE = await loadSql(
  sqlDir,
  'get_profile.sql',
);
const SQL_LIST_ACTOR_PROFILES = await loadSql(
  sqlDir,
  'list_actor_profiles.sql',
);
const SQL_SET_PROFILE = await loadSql(
  sqlDir,
  'set_profile.sql',
);
const SQL_GET_PROGRESS = await loadSql(
  sqlDir,
  'get_progress.sql',
);
const SQL_SET_PROGRESS = await loadSql(
  sqlDir,
  'set_progress.sql',
);

export async function getProfile(
  id: string,
): Promise<unknown | null> {
  const pg = await getPg();
  const r = await pg.queryObject<{ payload: unknown }>(
    SQL_GET_PROFILE,
    [id],
  );
  const row = r.rows[0];
  return row?.payload ?? null;
}

export async function listActorProfiles(): Promise<
  { id: string; payload: unknown }[]
> {
  const pg = await getPg();
  const r = await pg.queryObject<
    { id: string; payload: unknown }
  >(
    SQL_LIST_ACTOR_PROFILES,
  );
  return r.rows;
}

export async function setProfile(
  id: string,
  value: unknown,
): Promise<void> {
  const pg = await getPg();
  await pg.queryArray(SQL_SET_PROFILE, [
    id,
    JSON.stringify(value),
  ]);
}

export async function getProgress(
  id: string,
): Promise<unknown | null> {
  const pg = await getPg();
  const r = await pg.queryObject<{ payload: unknown }>(
    SQL_GET_PROGRESS,
    [
      id,
    ],
  );
  const row = r.rows[0];
  return row?.payload ?? null;
}

export async function setProgress(
  id: string,
  value: unknown,
): Promise<void> {
  const pg = await getPg();
  await pg.queryArray(SQL_SET_PROGRESS, [
    id,
    JSON.stringify(value),
  ]);
}
