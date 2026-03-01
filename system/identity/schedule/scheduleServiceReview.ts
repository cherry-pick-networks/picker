//  Schedule service: get row by id, apply review, record review.

import { applyReview } from './fsrsAdapter.ts';
import { rowToItem } from './mapperService.ts';
import type { ScheduleItem } from './schema.ts';
import { parseScheduleItemId } from './schema.ts';
import type { ScheduleItemRow } from './store.ts';
import { IdentityStores } from '#system/identity/IdentityStores.ts';

async function getRowById(
  id: string,
): Promise<ScheduleItemRow | null> {
  const parsed = parseScheduleItemId(id);
  if (!parsed) return null;
  const row = await IdentityStores.scheduleStore
    .getScheduleItem(
      parsed.actor_id,
      parsed.source_id,
      parsed.unit_id,
    );
  return row;
}

async function applyAndSaveReview(
  row: ScheduleItemRow,
  grade: number,
  at: string,
): Promise<ScheduleItemRow> {
  const { payload, next_due_at } = applyReview(
    row.payload,
    grade,
    at,
  );
  const updated: ScheduleItemRow = {
    ...row,
    payload,
    next_due_at,
    updated_at: at,
  };
  await IdentityStores.scheduleStore.setScheduleItem(
    updated,
  );
  return updated;
}

export async function recordReview(
  id: string,
  grade: number,
  reviewedAt?: string,
): Promise<ScheduleItem | null> {
  const row = await getRowById(id);
  if (!row) return null;
  const at = reviewedAt ?? new Date().toISOString();
  return rowToItem(
    await applyAndSaveReview(row, grade, at),
  );
}
