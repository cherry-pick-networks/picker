//  Semantic item recommend: payload/concept filter, load, search. Used by semanticItemService.

import { ContentStores } from '#system/content/ContentStores.ts';
import { ContentEmbeddingService } from '#system/content/ContentEmbeddingService.ts';

export function payloadConceptId(
  payload: unknown,
): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const c =
    (payload as Record<string, unknown>)['concept_id'];
  return typeof c === 'string' ? c : null;
}

export function filterByConceptIds(
  hits: { item_id: string; score: number }[],
  conceptIds: string[],
  itemPayloadById: Map<
    string,
    Record<string, unknown> | null
  >,
): { item_id: string; score: number }[] {
  if (conceptIds.length === 0) return hits;
  const set = new Set(conceptIds);
  return hits.filter((h) => {
    const payload = itemPayloadById.get(h.item_id);
    const id = payloadConceptId(payload);
    return id != null && set.has(id);
  });
}

export async function loadItemPayloads(
  itemIds: string[],
): Promise<Map<string, Record<string, unknown> | null>> {
  const itemPayloadById = new Map<
    string,
    Record<string, unknown> | null
  >();
  for (const id of itemIds) {
    const p = await ContentStores.itemStore.getItem(id);
    itemPayloadById.set(
      id,
      p != null && typeof p === 'object'
        ? (p as Record<string, unknown>)
        : null,
    );
  }
  return itemPayloadById;
}

export async function searchAndLoadPayloads(
  embedding: number[],
  cap: number,
): Promise<{
  raw: { item_id: string; score: number }[];
  itemPayloadById: Map<
    string,
    Record<string, unknown> | null
  >;
}> {
  const raw = await ContentStores.itemEmbeddingStore
    .searchItemEmbeddings(
      embedding,
      cap * 2,
    );
  const itemIds = [...new Set(raw.map((r) => r.item_id))];
  const itemPayloadById = await loadItemPayloads(itemIds);
  return { raw, itemPayloadById };
}

export async function getEmbedAndSearch(
  q: string,
  cap: number,
): Promise<
  | {
    ok: true;
    cap: number;
    raw: { item_id: string; score: number }[];
    itemPayloadById: Map<
      string,
      Record<string, unknown> | null
    >;
  }
  | { ok: false; status: 502; message: string }
> {
  const embed = await ContentEmbeddingService.getEmbedding(
    q,
  );
  if (!embed.ok) {
    return { ok: false, status: 502, message: embed.error };
  }
  const payload = await searchAndLoadPayloads(
    embed.embedding,
    cap,
  );
  return { ok: true, cap, ...payload };
}
