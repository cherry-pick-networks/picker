/** Weekly plan: new_units from annual (week 1–52), review_units in range. */

import type { ScheduleItem } from "./schedule.schema.ts";
import { getAnnualCurriculum } from "./schedule-annual.service.ts";
import { rowToItem } from "./schedule-mapper.service.ts";
import * as scheduleStore from "./schedule.store.ts";

const SLOTS_PER_WEEK = 3;

export interface WeeklyPlan {
  week_number: number;
  week_start: string;
  week_end: string;
  new_units: { source_id: string; unit_id: string }[];
  review_units: ScheduleItem[];
}

/** Thursday of the same ISO week as date (for week-number calc). */
function toWeekThursday(date: Date): Date {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  return d;
}

/** ISO week number (1–53) from date. Week 1 = week containing Jan 4. */
function getWeekNumber(date: Date): number {
  const thursday = toWeekThursday(date);
  const jan1 = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  return 1 +
    Math.floor(
      (thursday.getTime() - jan1.getTime()) / (7 * 24 * 60 * 60 * 1000),
    );
}

function endOfDayPlusDays(d: Date, days: number): Date {
  const e = new Date(d);
  e.setDate(e.getDate() + days);
  e.setHours(23, 59, 59, 999);
  return e;
}

function weekRange(weekStart: string): { start: string; end: string } {
  const start = new Date(weekStart);
  const end = endOfDayPlusDays(start, 6);
  return { start: start.toISOString(), end: end.toISOString() };
}

// function-length-ignore
export async function getWeeklyPlan(
  actorId: string,
  weekStart: string,
  options?: { level?: string },
): Promise<WeeklyPlan> {
  const { start, end } = weekRange(weekStart);
  const level = options?.level;
  const weekNum = getWeekNumber(new Date(weekStart));
  const year = new Date(weekStart).getFullYear();
  const [dueRows, annual] = await Promise.all([
    scheduleStore.listDue(actorId, start, end),
    getAnnualCurriculum({ level, year }),
  ]);
  const review_units = dueRows.map(rowToItem);
  const weekIndex = (weekNum - 1) % 52;
  const weekEntry = annual.weeks[weekIndex];
  const new_units = (weekEntry?.slots ?? [])
    .map((s) => s.new_unit)
    .filter((u): u is { source_id: string; unit_id: string } => u != null);
  return {
    week_number: weekNum,
    week_start: start,
    week_end: end,
    new_units: new_units.slice(0, SLOTS_PER_WEEK),
    review_units,
  };
}
