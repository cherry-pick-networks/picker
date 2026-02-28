/**
 * FSRS adapter: schedule item → in-house FSRS (fsrs.ts); returns next_due_at.
 */
// function-length-ignore-file — small adapter (store.md §P).

import { initState as fsrsInitState, scheduleNew, scheduleReview } from './fsrs.ts';
import type { ScheduleItemPayload } from './scheduleSchema.ts';

function toState(
  p: ScheduleItemPayload,
): { difficulty: number; stability: number } {
  return {
    difficulty: p.d ?? 5,
    stability: p.s ?? 0,
  };
}

export function initState(): {
  payload: ScheduleItemPayload;
  next_due_at: string;
} {
  const now = new Date();
  const state = fsrsInitState();
  return {
    payload: {
      d: state.difficulty,
      s: state.stability,
      grade_history: [],
    },
    next_due_at: now.toISOString(),
  };
}

export function applyReview(
  current: ScheduleItemPayload,
  grade: number,
  reviewedAt: string,
): { payload: ScheduleItemPayload; next_due_at: string } {
  const g = Math.min(4, Math.max(1, Math.round(grade)));
  const at = new Date(reviewedAt);
  const state = toState(current);
  const isNew = (current.s ?? 0) <= 0 && !current.last_reviewed_at;
  const { nextDue, state: nextState } = isNew ? scheduleNew(g, at) : scheduleReview(
    state,
    g,
    new Date(current.last_reviewed_at ?? reviewedAt),
    at,
  );
  const intervalDays = Math.round(
    (nextDue.getTime() - at.getTime()) / (24 * 60 * 60 * 1000),
  );
  const gradeHistory = [...(current.grade_history ?? []), g];
  return {
    payload: {
      d: nextState.difficulty,
      s: nextState.stability,
      last_reviewed_at: reviewedAt,
      last_interval_days: intervalDays,
      grade_history: gradeHistory,
    },
    next_due_at: nextDue.toISOString(),
  };
}
