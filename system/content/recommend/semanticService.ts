//
// Semantic recommend: search by query (optional concept_ids filter).
// Returns Copilot-facing recommendations (file_name, page, paragraph).
//

import { ContentEmbeddingService } from '#system/content/ContentEmbeddingService.ts';
import type { Source } from '#system/content/material/sourceSchema.ts';
import type { CopilotRecommendation } from './responseSchema.ts';
import {
  filterByConceptIds,
  mapHitsToRecommendations,
  type RecommendHit,
  searchChunksAndLoadSources,
} from './semanticServiceHelpers.ts';

export type { RecommendHit } from './semanticServiceHelpers.ts';

export type RecommendResult =
  | { ok: true; recommendations: CopilotRecommendation[] }
  | { ok: false; status: 400 | 502; message: string };

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

async function getEmbedAndSearch(
  q: string,
  cap: number,
): Promise<
  | {
    ok: true;
    cap: number;
    hits: RecommendHit[];
    sourceById: Map<string, Source>;
  }
  | { ok: false; status: 502; message: string }
> {
  const embed = await ContentEmbeddingService.getEmbedding(
    q,
  );
  if (!embed.ok) {
    return { ok: false, status: 502, message: embed.error };
  }
  const { hits, sourceById } =
    await searchChunksAndLoadSources(
      embed.embedding,
      cap,
    );
  return { ok: true, cap, hits, sourceById };
}

export async function recommend(
  query: string,
  conceptIds: string[] | undefined,
  limit: number = DEFAULT_LIMIT,
): Promise<RecommendResult> {
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
      recommendations: mapHitsToRecommendations(
        conceptIds?.length
          ? filterByConceptIds(
            search.hits,
            conceptIds,
            search.sourceById,
          )
          : search.hits,
        search.sourceById,
        search.cap,
      ),
    }
    : {
      ok: false,
      status: search.status,
      message: search.message,
    };
}
