/** Schedule service: CRUD, due list, review. */
// function-length-ignore-file — schedule service orchestration (store.md §P).

import { applyReview, initState } from "./fsrsAdapter.ts";
import type { ScheduleItem } from "./scheduleSchema.ts";
import { parseScheduleItemId, scheduleItemId } from "./scheduleSchema.ts";
import { rowToItem } from "./scheduleMapperService.ts";
import * as scheduleStore from "./scheduleStore.ts";

export { rowToItem };

export async function getScheduleItem(
  actorId: string,
  sourceId: string,
  unitId: string,
): Promise<ScheduleItem | null> {
  const row = await scheduleStore.getScheduleItem(actorId, sourceId, unitId);
  return row ? rowToItem(row) : null;
}

export async function getScheduleItemById(
  id: string,
): Promise<ScheduleItem | null> {
  const parsed = parseScheduleItemId(id);
  if (!parsed) return null;
  return await getScheduleItem(
    parsed.actor_id,
    parsed.source_id,
    parsed.unit_id,
  );
}

export async function listItems(
  actorId: string,
  sourceId?: string,
): Promise<ScheduleItem[]> {
  const rows = await scheduleStore.listScheduleItemsByActor(actorId, sourceId);
  return rows.map(rowToItem);
}

export async function listDue(
  actorId: string,
  from: string,
  to: string,
): Promise<ScheduleItem[]> {
  const rows = await scheduleStore.listDue(actorId, from, to);
  return rows.map(rowToItem);
}

export async function createItem(
  actorId: string,
  sourceId: string,
  unitId: string,
): Promise<ScheduleItem> {
  const existing = await scheduleStore.getScheduleItem(
    actorId,
    sourceId,
    unitId,
  );
  if (existing) return rowToItem(existing);
  const { payload, next_due_at } = initState();
  const now = new Date().toISOString();
  const row: scheduleStore.ScheduleItemRow = {
    actor_id: actorId,
    source_id: sourceId,
    unit_id: unitId,
    payload,
    next_due_at,
    created_at: now,
    updated_at: now,
  };
  await scheduleStore.setScheduleItem(row);
  return rowToItem(row);
}

// function-length-ignore
export async function recordReview(
  id: string,
  grade: number,
  reviewedAt?: string,
): Promise<ScheduleItem | null> {
  const parsed = parseScheduleItemId(id);
  if (!parsed) return null;
  const row = await scheduleStore.getScheduleItem(
    parsed.actor_id,
    parsed.source_id,
    parsed.unit_id,
  );
  if (!row) return null;
  const at = reviewedAt ?? new Date().toISOString();
  const { payload, next_due_at } = applyReview(row.payload, grade, at);
  const updated: scheduleStore.ScheduleItemRow = {
    ...row,
    payload,
    next_due_at,
    updated_at: at,
  };
  await scheduleStore.setScheduleItem(updated);
  return rowToItem(updated);
}

export { scheduleItemId };
