//  Item discrimination: build by actor/item, high-low split. Used by testItemDiscriminationService.

import { ReportStores } from '#reporting/ReportStores.ts';

type Row = Awaited<
  ReturnType<
    typeof ReportStores.itemDiscriminationStore.listItemResponsesForDiscrimination
  >
>[number];

export function buildByActor(
  rows: Row[],
): Map<string, { correct: number; total: number }> {
  const byActor = new Map<
    string,
    { correct: number; total: number }
  >();
  for (const r of rows) {
    const cur = byActor.get(r.actor_id) ??
      { correct: 0, total: 0 };
    cur.total += 1;
    if (r.correct) cur.correct += 1;
    byActor.set(r.actor_id, cur);
  }
  return byActor;
}

export function buildActorScores(
  rows: Row[],
): { actor_id: string; score: number }[] {
  const byActor = buildByActor(rows);
  const scores = Array.from(byActor.entries()).map((
    [actor_id, v],
  ) => ({
    actor_id,
    score: v.total > 0 ? v.correct / v.total : 0,
  }));
  scores.sort((a, b) => b.score - a.score);
  return scores;
}

export function highLowIds(
  actorScores: { actor_id: string; score: number }[],
): { highIds: Set<string>; lowIds: Set<string> } {
  const n = actorScores.length;
  const size = Math.max(1, Math.ceil(n * 0.27));
  return {
    highIds: new Set(
      actorScores.slice(0, size).map((x) => x.actor_id),
    ),
    lowIds: new Set(
      actorScores.slice(-size).map((x) => x.actor_id),
    ),
  };
}

export type ItemEntry = {
  highCorrect: number;
  highTotal: number;
  lowCorrect: number;
  lowTotal: number;
};

export function getOrCreateItemEntry(
  byItem: Map<string, ItemEntry>,
  itemId: string,
): ItemEntry {
  let cur = byItem.get(itemId);
  if (!cur) {
    cur = {
      highCorrect: 0,
      highTotal: 0,
      lowCorrect: 0,
      lowTotal: 0,
    };
    byItem.set(itemId, cur);
  }
  return cur;
}

export function updateEntry(
  cur: ItemEntry,
  r: Row,
  highIds: Set<string>,
  lowIds: Set<string>,
): void {
  if (highIds.has(r.actor_id)) {
    cur.highTotal += 1;
    if (r.correct) cur.highCorrect += 1;
  } else if (lowIds.has(r.actor_id)) {
    cur.lowTotal += 1;
    if (r.correct) cur.lowCorrect += 1;
  }
}

export function buildByItem(
  rows: Row[],
  highIds: Set<string>,
  lowIds: Set<string>,
): Map<string, ItemEntry> {
  const byItem = new Map<string, ItemEntry>();
  for (const r of rows) {
    const cur = getOrCreateItemEntry(byItem, r.item_id);
    updateEntry(cur, r, highIds, lowIds);
  }
  return byItem;
}
