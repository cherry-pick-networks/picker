/**
 * Actor profile and progress store. PostgreSQL via shared/infra pg client.
 * Tables: actor_profile, actor_progress (see shared/infra/schema/01_actor.sql).
 */

import { getPg } from "#shared/infra/pg.client.ts";
import {
  type ProfileRow,
  type ProgressRow,
  rowToProfile,
  rowToProgress,
  valueToProfileRow,
  valueToProgressRow,
} from "./profile.helpers.ts";

const SQL_SELECT_PROFILE =
  "SELECT id, created_at, updated_at, grade, preferences, goals " +
  "FROM actor_profile WHERE id = $1";
const SQL_UPSERT_PROFILE =
  "INSERT INTO actor_profile (id, created_at, updated_at, " +
  "grade, preferences, goals) VALUES ($1, $2, $3, $4, $5, $6) " +
  "ON CONFLICT (id) DO UPDATE " +
  "SET updated_at = EXCLUDED.updated_at, grade = EXCLUDED.grade, " +
  "preferences = EXCLUDED.preferences, goals = EXCLUDED.goals";
const SQL_SELECT_PROGRESS = "SELECT id, updated_at, state, current_step " +
  "FROM actor_progress WHERE id = $1";
const SQL_UPSERT_PROGRESS =
  "INSERT INTO actor_progress (id, updated_at, state, current_step) " +
  "VALUES ($1, $2, $3, $4) " +
  "ON CONFLICT (id) DO UPDATE SET updated_at = EXCLUDED.updated_at, " +
  "state = EXCLUDED.state, current_step = EXCLUDED.current_step";

export async function getProfile(id: string): Promise<unknown | null> {
  const sql = await getPg();
  const { rows } = await sql.queryObject<ProfileRow>(SQL_SELECT_PROFILE, [id]);
  if (rows.length === 0) return null;
  return rowToProfile(rows[0]);
}

export async function setProfile(id: string, value: unknown): Promise<void> {
  const sql = await getPg();
  const row = valueToProfileRow(id, value);
  await sql.queryObject(SQL_UPSERT_PROFILE, [
    row.id,
    row.created_at,
    row.updated_at,
    row.grade,
    row.preferences,
    row.goals,
  ]);
}

export async function getProgress(id: string): Promise<unknown | null> {
  const sql = await getPg();
  const { rows } = await sql.queryObject<ProgressRow>(SQL_SELECT_PROGRESS, [
    id,
  ]);
  if (rows.length === 0) return null;
  return rowToProgress(rows[0]);
}

export async function setProgress(id: string, value: unknown): Promise<void> {
  const sql = await getPg();
  const row = valueToProgressRow(id, value);
  await sql.queryObject(SQL_UPSERT_PROGRESS, [
    row.id,
    row.updated_at,
    row.state,
    row.current_step,
  ]);
}
