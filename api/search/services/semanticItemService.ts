//
// Semantic item recommend: search items by query (optional concept_ids).
// Returns item recommendations (item_id, concept_id, stem_excerpt, score).
//

import {
  type ItemRecommendation,
  itemToRecommendation,
} from '#api/search/configurations/responseSchema.ts';
import {
  filterByConceptIds,
  getEmbedAndSearch,
} from './semanticItemServiceHelpers.ts';

export type ItemRecommendResult =
  | { ok: true; recommendations: ItemRecommendation[] }
  | { ok: false; status: 400 | 502; message: string };

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export async function recommendItems(
  query: string,
  conceptIds: string[] | undefined,
  limit: number = DEFAULT_LIMIT,
): Promise<ItemRecommendResult> {
  const q = typeof query === 'string' ? query.trim() : '';
  if (q.length === 0) {
    return {
      ok: false,
      status: 400,
      message: 'query required',
    };
  }
  const search = await getEmbedAndSearch(
    q,
    Math.min(Math.max(1, limit), MAX_LIMIT),
  );
  return search.ok
    ? {
      ok: true,
      recommendations: (conceptIds?.length
        ? filterByConceptIds(
          search.raw,
          conceptIds,
          search.itemPayloadById,
        )
        : search.raw)
        .slice(0, search.cap)
        .map((h) =>
          itemToRecommendation(
            h.item_id,
            search.itemPayloadById.get(h.item_id) ?? null,
            Number(h.score),
          )
        ),
    }
    : {
      ok: false,
      status: search.status,
      message: search.message,
    };
}
