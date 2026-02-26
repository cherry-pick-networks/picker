/** Schedule service: CRUD, due list, review, grammar unit resolution. */
// function-length-ignore-file — schedule service orchestration (store.md §P).

import { listSources } from "#system/source/source.service.ts";
import { applyReview, initState } from "./fsrs-adapter.ts";
import type { ScheduleItem } from "./schedule.schema.ts";
import {
  parseScheduleItemId,
  scheduleItemId,
} from "./schedule.schema.ts";
import * as scheduleStore from "./schedule.store.ts";

const GRAMMAR_SOURCE_PREFIX = "book-grammar-";

function rowToItem(row: scheduleStore.ScheduleItemRow): ScheduleItem {
  return {
    actor_id: row.actor_id,
    source_id: row.source_id,
    unit_id: row.unit_id,
    payload: row.payload,
    next_due_at: row.next_due_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

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

/** List (source_id, unit_id) from grammar sources (source payload.metadata.unit_ids). */
export async function listGrammarUnits(level?: string): Promise<
  { source_id: string; unit_id: string; level?: string }[]
> {
  const sources = await listSources();
  const out: { source_id: string; unit_id: string; level?: string }[] = [];
  for (const s of sources) {
    if (!s.source_id.startsWith(GRAMMAR_SOURCE_PREFIX)) continue;
    const meta = s.metadata as { level?: string; unit_ids?: string[] } | undefined;
    const unitIds = meta?.unit_ids ?? [];
    const lvl = level ?? meta?.level;
    if (level != null && lvl !== level) continue;
    for (const unitId of unitIds) {
      out.push({ source_id: s.source_id, unit_id: unitId, level: lvl });
    }
  }
  return out;
}

/** Week plan: new_units (not yet scheduled) and review_units (due in range). */
export interface WeeklyPlan {
  week_start: string;
  week_end: string;
  new_units: { source_id: string; unit_id: string }[];
  review_units: ScheduleItem[];
}

/** Start of week (Monday) and end (Sunday 23:59:59.999) in ISO. */
// function-length-ignore
function weekRange(weekStart: string): { start: string; end: string } {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}

// function-length-ignore
export async function getWeeklyPlan(
  actorId: string,
  weekStart: string,
  options?: { level?: string; new_unit_count?: number },
): Promise<WeeklyPlan> {
  const { start, end } = weekRange(weekStart);
  const level = options?.level;
  const newCount = options?.new_unit_count ?? 5;
  const [dueRows, grammarUnits] = await Promise.all([
    scheduleStore.listDue(actorId, start, end),
    listGrammarUnits(level),
  ]);
  const review_units = dueRows.map(rowToItem);
  const existingKeys = new Set(
    (await scheduleStore.listScheduleItemsByActor(actorId)).map(
      (r) => `${r.source_id}:${r.unit_id}`,
    ),
  );
  const new_units: { source_id: string; unit_id: string }[] = [];
  for (const u of grammarUnits) {
    if (new_units.length >= newCount) break;
    const key = `${u.source_id}:${u.unit_id}`;
    if (!existingKeys.has(key)) {
      new_units.push({ source_id: u.source_id, unit_id: u.unit_id });
      existingKeys.add(key);
    }
  }
  return {
    week_start: start,
    week_end: end,
    new_units,
    review_units,
  };
}

export { scheduleItemId };
