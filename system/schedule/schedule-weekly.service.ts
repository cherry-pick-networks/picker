/** Weekly plan: new_units (unscheduled) and review_units (due in range). */

import type { ScheduleItem } from "./schedule.schema.ts";
import { listGrammarUnits } from "./schedule-grammar.service.ts";
import { rowToItem } from "./schedule-mapper.service.ts";
import * as scheduleStore from "./schedule.store.ts";

export interface WeeklyPlan {
  week_start: string;
  week_end: string;
  new_units: { source_id: string; unit_id: string }[];
  review_units: ScheduleItem[];
}

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
