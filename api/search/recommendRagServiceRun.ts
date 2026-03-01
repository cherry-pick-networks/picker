//
// GraphRAG: search chunks, embed-and-search. Used by ragService.ts.
//

import { ContentStores } from '#api/storage/ContentStores.ts';
import { ContentEmbeddingService } from '#api/search/ContentEmbeddingService.ts';
import {
  filterByConceptIds,
  loadSourceByIdForHits,
  type RagRecommendHit,
} from '#api/search/recommendRagServiceHelpers.ts';

export async function doSearchChunks(
  embedding: number[],
  cap: number,
): Promise<{
  hits: RagRecommendHit[];
  sourceById: Awaited<
    ReturnType<typeof loadSourceByIdForHits>
  >;
}> {
  const raw = await ContentStores.chunkStore.searchChunks(
    embedding,
    cap * 2,
  );
  const hits: RagRecommendHit[] = raw.map((r) => ({
    source_id: r.source_id,
    chunk_index: r.chunk_index,
    text: r.text,
    score: Number(r.score),
  }));
  const sourceById = await loadSourceByIdForHits(hits);
  return { hits, sourceById };
}

export async function runEmbedAndSearch(
  embeddingText: string,
  cap: number,
  expandedIds: string[],
): Promise<
  | {
    ok: false;
    response: {
      ok: false;
      status: 400 | 502;
      message: string;
    };
  }
  | {
    ok: true;
    hits: RagRecommendHit[];
    sourceById: Awaited<
      ReturnType<typeof loadSourceByIdForHits>
    >;
    cap: number;
  }
> {
  const embed = await ContentEmbeddingService.getEmbedding(
    embeddingText,
  );
  if (!embed.ok) {
    return {
      ok: false as const,
      response: {
        ok: false,
        status: 502,
        message: embed.error,
      },
    };
  }
  const { hits, sourceById } = await doSearchChunks(
    embed.embedding,
    cap,
  );
  return {
    ok: true as const,
    hits: expandedIds.length > 0
      ? filterByConceptIds(hits, expandedIds, sourceById)
      : hits,
    sourceById,
    cap,
  };
}
