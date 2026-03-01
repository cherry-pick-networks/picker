//  Item discrimination: compute per-item stats. Used by testItemDiscriminationService.

import { ReportStores } from '#reporting/ReportStores.ts';
import { buildByItem } from './testItemDiscriminationServiceHelpers.ts';

type Row = Awaited<
  ReturnType<
    typeof ReportStores.itemDiscriminationStore.listItemResponsesForDiscrimination
  >
>[number];

export function computeItems(
  rows: Row[],
  highIds: Set<string>,
  lowIds: Set<string>,
  minResp: number,
): {
  item_id: string;
  discrimination: number;
  high_pass_rate: number;
  low_pass_rate: number;
}[] {
  const byItem = buildByItem(rows, highIds, lowIds);
  return Array.from(byItem.entries())
    .filter(([_, v]) =>
      v.highTotal >= minResp && v.lowTotal >= minResp
    )
    .map(([item_id, v]) => ({
      item_id,
      discrimination: v.highTotal > 0 && v.lowTotal > 0
        ? v.highCorrect / v.highTotal -
          v.lowCorrect / v.lowTotal
        : 0,
      high_pass_rate: v.highTotal > 0
        ? v.highCorrect / v.highTotal
        : 0,
      low_pass_rate: v.lowTotal > 0
        ? v.lowCorrect / v.lowTotal
        : 0,
    }));
}
