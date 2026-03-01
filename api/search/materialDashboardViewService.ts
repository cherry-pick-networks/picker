//  Assembles source-dashboard view: source + lexis summary + related items.

import { ContentStores } from '#api/storage/ContentStores.ts';
import type { SourceDashboardView } from './materialDashboardViewSchema.ts';
import { getSource } from './materialService.ts';

const PREVIEW_LIMIT = 10;

function buildRelatedItems(
  itemRows: {
    id: string;
    payload: Record<string, unknown>;
  }[],
  itemsTotal: number,
): SourceDashboardView['related_items'] {
  const previewIds = itemRows.map((r) => r.id);
  const preview = itemRows.map((r) => ({
    item_id: (r.payload.item_id as string) ?? r.id,
    stem: r.payload.stem as string | undefined,
    concept_id: r.payload.concept_id as string | undefined,
    source: r.payload.source as string | undefined,
  }));
  return {
    total: itemsTotal,
    preview_ids: previewIds,
    preview,
  };
}

export async function getSourceDashboardView(
  sourceId: string,
): Promise<SourceDashboardView | null> {
  const source = await getSource(sourceId);
  if (source == null) return null;
  const [lexisTotal, headwords, itemsTotal, itemRows] =
    await Promise.all([
      ContentStores.lexisStore.countBySource(sourceId),
      ContentStores.lexisStore.getHeadwordsBySource(
        sourceId,
        PREVIEW_LIMIT,
      ),
      ContentStores.itemStore.countItemsBySource(sourceId),
      ContentStores.itemStore.listItemsBySource(
        sourceId,
        PREVIEW_LIMIT,
      ),
    ]);
  return {
    source_info: source,
    lexis_summary: {
      total: lexisTotal,
      preview: headwords,
    },
    related_items: buildRelatedItems(itemRows, itemsTotal),
  };
}
