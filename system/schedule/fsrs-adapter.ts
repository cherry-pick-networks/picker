/**
 * FSRS adapter (stub). Maps schedule item state + review to next_due_at.
 * Replace with @squeakyrobot/fsrs (or real FSRS-rs) when integrating.
 */

import type { ScheduleItemPayload } from "./schedule.schema.ts";

/** Days until next review by grade (1–4). Stub; real FSRS uses D/S model. */
const INTERVAL_DAYS = [1, 3, 7, 14] as const;

export function initState(): {
  payload: ScheduleItemPayload;
  next_due_at: string;
} {
  const now = new Date().toISOString();
  return {
    payload: {
      d: 5,
      s: 0,
      last_interval_days: 0,
      grade_history: [],
    },
    next_due_at: now,
  };
}

export function applyReview(
  current: ScheduleItemPayload,
  grade: number,
  reviewedAt: string,
): { payload: ScheduleItemPayload; next_due_at: string } {
  const g = Math.min(4, Math.max(1, Math.round(grade)));
  const intervalDays = INTERVAL_DAYS[g - 1] ?? 1;
  const reviewed = new Date(reviewedAt);
  const next = new Date(reviewed);
  next.setDate(next.getDate() + intervalDays);
  const gradeHistory = [...(current.grade_history ?? []), g];
  return {
    payload: {
      d: current.d ?? 5,
      s: current.s ?? 0,
      last_reviewed_at: reviewedAt,
      last_interval_days: intervalDays,
      grade_history: gradeHistory,
    },
    next_due_at: next.toISOString(),
  };
}
