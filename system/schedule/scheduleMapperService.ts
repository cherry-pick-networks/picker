/** Map store row to ScheduleItem. */

import type { ScheduleItem } from './scheduleSchema.ts';
import type { ScheduleItemRow } from './scheduleStore.ts';

export function rowToItem(row: ScheduleItemRow): ScheduleItem {
  const item: ScheduleItem = {
    actor_id: row.actor_id,
    source_id: row.source_id,
    unit_id: row.unit_id,
    payload: row.payload,
    next_due_at: row.next_due_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
  return item;
}
