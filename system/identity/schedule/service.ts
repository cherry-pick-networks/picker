//  Schedule service: CRUD, due list. Review in scheduleServiceReview.ts.

import { initState } from './fsrsAdapter.ts';
import type { ScheduleItem } from './schema.ts';
import {
  parseScheduleItemId,
  scheduleItemId,
} from './schema.ts';
import { rowToItem } from './mapperService.ts';
import type { ScheduleItemRow } from './store.ts';
import { IdentityStores } from '#system/identity/IdentityStores.ts';

export { rowToItem };
export { recordReview } from './scheduleServiceReview.ts';
export { scheduleItemId };

export async function getScheduleItem(
  actorId: string,
  sourceId: string,
  unitId: string,
): Promise<ScheduleItem | null> {
  const row = await IdentityStores.scheduleStore
    .getScheduleItem(
      actorId,
      sourceId,
      unitId,
    );
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
  const rows = await IdentityStores.scheduleStore
    .listScheduleItemsByActor(actorId, sourceId);
  return rows.map(rowToItem);
}

export async function listDue(
  actorId: string,
  from: string,
  to: string,
): Promise<ScheduleItem[]> {
  const rows = await IdentityStores.scheduleStore.listDue(
    actorId,
    from,
    to,
  );
  return rows.map(rowToItem);
}

async function createAndSaveNewRow(
  actorId: string,
  sourceId: string,
  unitId: string,
): Promise<ScheduleItemRow> {
  const now = new Date().toISOString();
  const row: ScheduleItemRow = {
    actor_id: actorId,
    source_id: sourceId,
    unit_id: unitId,
    ...initState(),
    created_at: now,
    updated_at: now,
  };
  await IdentityStores.scheduleStore.setScheduleItem(row);
  return row;
}

export async function createItem(
  actorId: string,
  sourceId: string,
  unitId: string,
): Promise<ScheduleItem> {
  const existing = await IdentityStores.scheduleStore
    .getScheduleItem(
      actorId,
      sourceId,
      unitId,
    );
  if (existing) return rowToItem(existing);
  return rowToItem(
    await createAndSaveNewRow(actorId, sourceId, unitId),
  );
}
