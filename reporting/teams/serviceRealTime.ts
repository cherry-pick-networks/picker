//  Report teams: real-time intervention (review log). Used by service.ts.

import { IdentityStores } from '#identity/IdentityStores.ts';
import type { RealTimeInterventionQuery } from '#reporting/teams/schema.ts';

async function listItemResponseLog(
  actorId: string,
  minutes: number,
): Promise<
  Array<{
    id: string;
    actor_id: string;
    item_id: string;
    recorded_at: string;
  }>
> {
  const to = new Date().toISOString();
  const from = new Date(Date.now() - minutes * 60 * 1000)
    .toISOString();
  const rows = await IdentityStores.achievementStore
    .listItemResponsesByActor(actorId, from, to);
  return rows.map((r) => ({
    id: String(r.id),
    actor_id: r.actor_id,
    item_id: r.item_id,
    recorded_at: r.recorded_at,
  }));
}

export async function getRealTimeIntervention(
  q: RealTimeInterventionQuery,
): Promise<{
  log: Array<{
    id: string;
    actor_id: string;
    item_id: string;
    recorded_at: string;
  }>;
}> {
  if (!q.actor_id) return { log: [] };
  const log = await listItemResponseLog(
    q.actor_id,
    q.minutes ?? 60,
  );
  return { log };
}
