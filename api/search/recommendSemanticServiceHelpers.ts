//  Semantic recommend: filter, load sources, search, map. Used by semanticService.

import { ContentStores } from '#api/storage/ContentStores.ts';
import { getSource } from '#api/storage/catalog/service.ts';
import type { Source } from '#api/storage/catalog/sourceSchema.ts';
import {
  chunkToRecommendation,
  sourceToFileDisplayName,
  sourceToPage,
} from '#api/search/recommendResponseSchema.ts';
import type { CopilotRecommendation } from '#api/search/recommendResponseSchema.ts';

export type RecommendHit = {
  source_id: string;
  chunk_index: number;
  text: string;
  score: number;
};

export function filterByConceptIds(
  hits: RecommendHit[],
  conceptIds: string[],
  sourceById: Map<string, Source>,
): RecommendHit[] {
  if (conceptIds.length === 0) return hits;
  const set = new Set(conceptIds);
  return hits.filter((h) => {
    const src = sourceById.get(h.source_id);
    const ids = src?.extracted_concept_ids ?? [];
    return ids.some((id) => set.has(id));
  });
}

export async function loadSourceById(
  hits: { source_id: string }[],
): Promise<Map<string, Source>> {
  const sourceById = new Map<string, Source>();
  const ids = [...new Set(hits.map((h) => h.source_id))];
  for (const id of ids) {
    const s = await getSource(id);
    if (s) sourceById.set(id, s);
  }
  return sourceById;
}

export async function searchChunksAndLoadSources(
  embedding: number[],
  cap: number,
): Promise<
  { hits: RecommendHit[]; sourceById: Map<string, Source> }
> {
  const raw = await ContentStores.chunkStore.searchChunks(
    embedding,
    cap * 2,
  );
  const hits: RecommendHit[] = raw.map((r) => ({
    source_id: r.source_id,
    chunk_index: r.chunk_index,
    text: r.text,
    score: Number(r.score),
  }));
  const sourceById = await loadSourceById(hits);
  return { hits, sourceById };
}

export function mapHitsToRecommendations(
  hits: RecommendHit[],
  sourceById: Map<string, Source>,
  cap: number,
): CopilotRecommendation[] {
  return hits.slice(0, cap).map((h) => {
    const src = sourceById.get(h.source_id);
    const file_name = src
      ? sourceToFileDisplayName(
        h.source_id,
        src.metadata,
        src.url,
      )
      : h.source_id;
    const page = src
      ? sourceToPage(h.chunk_index, src.metadata)
      : h.chunk_index + 1;
    return chunkToRecommendation(file_name, page, h.text);
  });
}
