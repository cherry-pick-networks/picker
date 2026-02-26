/** Schedule item storage (Postgres). */
// function-length-ignore-file — store CRUD (store.md §P).

import { getPg } from "#shared/infra/pg.client.ts";
import { loadSql } from "#shared/infra/sql-loader.ts";
import type { ScheduleItemPayload } from "./schedule.schema.ts";

const sqlDir = new URL("./sql/", import.meta.url);
const SQL_GET = await loadSql(sqlDir, "get_schedule_item.sql");
const SQL_SET = await loadSql(sqlDir, "set_schedule_item.sql");
const SQL_LIST_BY_ACTOR = await loadSql(
  sqlDir,
  "list_schedule_items_by_actor.sql",
);
const SQL_LIST_DUE = await loadSql(sqlDir, "list_due.sql");

function parsePayload(raw: unknown): ScheduleItemPayload {
  return (typeof raw === "string"
    ? JSON.parse(raw)
    : raw) as ScheduleItemPayload;
}

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
  const r = await pg.queryObject<ScheduleItemRow>(SQL_GET, [
    actorId,
    sourceId,
    unitId,
  ]);
  const row = r.rows[0];
  if (!row) return null;
  return { ...row, payload: parsePayload(row.payload) };
}

export async function setScheduleItem(row: ScheduleItemRow): Promise<void> {
  const pg = await getPg();
  await pg.queryArray(SQL_SET, [
    row.actor_id,
    row.source_id,
    row.unit_id,
    JSON.stringify(row.payload),
    row.next_due_at,
    row.created_at,
    row.updated_at,
  ]);
}

export async function listScheduleItemsByActor(
  actorId: string,
  sourceId?: string,
): Promise<ScheduleItemRow[]> {
  const pg = await getPg();
  const r = await pg.queryObject<ScheduleItemRow>(SQL_LIST_BY_ACTOR, [
    actorId,
    sourceId ?? null,
  ]);
  return r.rows.map((row) => ({ ...row, payload: parsePayload(row.payload) }));
}

export async function listDue(
  actorId: string,
  from: string,
  to: string,
): Promise<ScheduleItemRow[]> {
  const pg = await getPg();
  const r = await pg.queryObject<ScheduleItemRow>(SQL_LIST_DUE, [
    actorId,
    from,
    to,
  ]);
  return r.rows.map((row) => ({ ...row, payload: parsePayload(row.payload) }));
}
