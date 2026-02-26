/** Schedule item storage (Postgres). */

import { getPg } from "#shared/infra/pg.client.ts";
import type { ScheduleItemPayload } from "./schedule.schema.ts";

export interface ScheduleItemRow {
  actor_id: string;
  source_id: string;
  unit_id: string;
  payload: ScheduleItemPayload;
  next_due_at: string;
  created_at: string;
  updated_at: string;
}

export async function getScheduleItem(
  actorId: string,
  sourceId: string,
  unitId: string,
): Promise<ScheduleItemRow | null> {
  const pg = await getPg();
  const r = await pg.queryObject<ScheduleItemRow>(
    `SELECT actor_id, source_id, unit_id, payload, next_due_at::text, created_at::text, updated_at::text
     FROM schedule_item WHERE actor_id = $1 AND source_id = $2 AND unit_id = $3`,
    [actorId, sourceId, unitId],
  );
  const row = r.rows[0];
  if (!row) return null;
  const raw = row.payload;
  return {
    ...row,
    payload: (typeof raw === "string" ? JSON.parse(raw) : raw) as ScheduleItemPayload,
  };
}

export async function setScheduleItem(row: ScheduleItemRow): Promise<void> {
  const pg = await getPg();
  await pg.queryArray(
    `INSERT INTO schedule_item (actor_id, source_id, unit_id, payload, next_due_at, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5::timestamptz, $6::timestamptz, $7::timestamptz)
     ON CONFLICT (actor_id, source_id, unit_id)
     DO UPDATE SET payload = $4, next_due_at = $5::timestamptz, updated_at = $7::timestamptz`,
    [
      row.actor_id,
      row.source_id,
      row.unit_id,
      JSON.stringify(row.payload),
      row.next_due_at,
      row.created_at,
      row.updated_at,
    ],
  );
}

export async function listScheduleItemsByActor(
  actorId: string,
  sourceId?: string,
): Promise<ScheduleItemRow[]> {
  const pg = await getPg();
  const r = sourceId
    ? await pg.queryObject<ScheduleItemRow>(
        `SELECT actor_id, source_id, unit_id, payload, next_due_at::text, created_at::text, updated_at::text
         FROM schedule_item WHERE actor_id = $1 AND source_id = $2 ORDER BY next_due_at`,
        [actorId, sourceId],
      )
    : await pg.queryObject<ScheduleItemRow>(
        `SELECT actor_id, source_id, unit_id, payload, next_due_at::text, created_at::text, updated_at::text
         FROM schedule_item WHERE actor_id = $1 ORDER BY next_due_at`,
        [actorId],
      );
  return r.rows.map((row) => {
    const raw = row.payload;
    return {
      ...row,
      payload: (typeof raw === "string" ? JSON.parse(raw) : raw) as ScheduleItemPayload,
    };
  });
}

export async function listDue(
  actorId: string,
  from: string,
  to: string,
): Promise<ScheduleItemRow[]> {
  const pg = await getPg();
  const r = await pg.queryObject<ScheduleItemRow>(
    `SELECT actor_id, source_id, unit_id, payload, next_due_at::text, created_at::text, updated_at::text
     FROM schedule_item
     WHERE actor_id = $1 AND next_due_at >= $2::timestamptz AND next_due_at <= $3::timestamptz
     ORDER BY next_due_at`,
    [actorId, from, to],
  );
  return r.rows.map((row) => {
    const raw = row.payload;
    return {
      ...row,
      payload: (typeof raw === "string" ? JSON.parse(raw) : raw) as ScheduleItemPayload,
    };
  });
}
