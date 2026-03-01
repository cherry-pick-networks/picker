//  RAG recommend: types, filter, load sources, map. Used by ragService.ts.

import { getSource } from '#api/storage/catalog/service.ts';
import type { Source } from '#api/storage/catalog/sourceSchema.ts';
import {
  chunkToRecommendation,
  sourceToFileDisplayName,
  sourceToPage,
} from '#api/search/configurations/responseSchema.ts';
import type { CopilotRecommendation } from '#api/search/configurations/responseSchema.ts';

export type RagRecommendHit = {
  source_id: string;
  chunk_index: number;
  text: string;
  score: number;
};

export type RagRecommendResult =
  | {
    ok: true;
    recommendations: CopilotRecommendation[];
    expanded_concept_ids?: string[];
    expanded_labels?: string[];
  }
  | { ok: false; status: 400 | 502; message: string };

export function filterByConceptIds(
  hits: RagRecommendHit[],
  conceptIds: string[],
  sourceById: Map<string, Source>,
): RagRecommendHit[] {
  if (conceptIds.length === 0) return hits;
  const set = new Set(conceptIds);
  return hits.filter((h) => {
    const src = sourceById.get(h.source_id);
    const ids = src?.extracted_concept_ids ?? [];
    return ids.some((id) => set.has(id));
  });
}

export async function loadSourceByIdForHits(
  hits: RagRecommendHit[],
): Promise<Map<string, Source>> {
  const sourceById = new Map<string, Source>();
  const ids = [...new Set(hits.map((h) => h.source_id))];
  for (const id of ids) {
    const s = await getSource(id);
    if (s) sourceById.set(id, s);
  }
  return sourceById;
}

export function mapHitsToRecommendations(
  hits: RagRecommendHit[],
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
