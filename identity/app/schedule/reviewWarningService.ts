//  List schedule items whose retrievability is below threshold.

import { retrievabilityAt } from './fsrs.ts';
import { scheduleItemId } from '#identity/config/jobs/schema.ts';
import type { ReviewWarning } from '#identity/config/jobs/schema.ts';
import { IdentityStores } from '#identity/sql/IdentityStores.ts';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_RETENTION_MIN = 0.9;

export interface ListReviewWarningsOptions {
  from?: string;
  to?: string;
  retention_min?: number;
}

function computeRetrievability(
  row: Awaited<
    ReturnType<
      typeof IdentityStores.scheduleStore.listScheduleItemsByActor
    >
  >[0],
  now: Date,
): number {
  const lastAt = row.payload.last_reviewed_at
    ? new Date(row.payload.last_reviewed_at)
    : new Date(row.created_at);
  const elapsedDays = (now.getTime() - lastAt.getTime()) /
    MS_PER_DAY;
  return retrievabilityAt(
    Math.max(0, elapsedDays),
    row.payload.s!,
  );
}

function toReviewWarning(
  row: Awaited<
    ReturnType<
      typeof IdentityStores.scheduleStore.listScheduleItemsByActor
    >
  >[0],
  now: Date,
  retentionMin: number,
): ReviewWarning | null {
  if (row.payload.s == null) return null;
  const retrievability = computeRetrievability(row, now);
  return retrievability >= retentionMin ? null : {
    id: scheduleItemId(row),
    actor_id: row.actor_id,
    source_id: row.source_id,
    unit_id: row.unit_id,
    next_due_at: row.next_due_at,
    retrievability,
  };
}

function collectWarnings(
  rows: Awaited<
    ReturnType<
      typeof IdentityStores.scheduleStore.listScheduleItemsByActor
    >
  >,
  now: Date,
  retentionMin: number,
  options?: ListReviewWarningsOptions,
): ReviewWarning[] {
  const warnings: ReviewWarning[] = [];
  for (const row of rows) {
    if (
      options?.from != null &&
      row.next_due_at < options.from
    ) continue;
    if (
      options?.to != null && row.next_due_at > options.to
    ) continue;
    const w = toReviewWarning(row, now, retentionMin);
    if (w != null) warnings.push(w);
  }
  return warnings;
}

export async function listReviewWarnings(
  actorId: string,
  options?: ListReviewWarningsOptions,
): Promise<ReviewWarning[]> {
  const rows = await IdentityStores.scheduleStore
    .listScheduleItemsByActor(
      actorId,
    );
  const now = new Date();
  const retentionMin = options?.retention_min ??
    DEFAULT_RETENTION_MIN;
  return collectWarnings(rows, now, retentionMin, options);
}
