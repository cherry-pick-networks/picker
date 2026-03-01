//
// GraphRAG recommend: concept expansion + semantic search. Returns Copilot schema.
//

import type { CopilotRecommendation } from '#api/search/recommendResponseSchema.ts';
import {
  loadSourceByIdForHits,
  mapHitsToRecommendations,
  type RagRecommendHit,
  type RagRecommendResult,
} from '#api/search/recommendRagServiceHelpers.ts';
import { prepareRagInput } from '#api/search/recommendRagServiceRunPrepare.ts';
import { runEmbedAndSearch } from '#api/search/recommendRagServiceRun.ts';

const DEFAULT_LIMIT = 10;

export type {
  RagRecommendHit,
  RagRecommendResult,
} from '#api/search/recommendRagServiceHelpers.ts';

function buildRagPayload(
  result: {
    hits: RagRecommendHit[];
    sourceById: Awaited<
      ReturnType<typeof loadSourceByIdForHits>
    >;
    cap: number;
  },
  expandedIds: string[],
  expandedLabels: string[],
): RagRecommendResult {
  const recommendations: CopilotRecommendation[] =
    mapHitsToRecommendations(
      result.hits,
      result.sourceById,
      result.cap,
    );
  const payload: RagRecommendResult = {
    ok: true,
    recommendations,
  };
  if (expandedIds.length > 0) {
    payload.expanded_concept_ids = expandedIds;
    if (expandedLabels.length > 0) {
      payload.expanded_labels = expandedLabels;
    }
  }
  return payload;
}

export async function recommendRag(
  query: string,
  conceptIds: string[] | undefined,
  expandConceptsFlag: boolean,
  limit: number = DEFAULT_LIMIT,
): Promise<RagRecommendResult> {
  const prepared = await prepareRagInput(
    query,
    conceptIds,
    expandConceptsFlag,
    limit,
  );
  if (!prepared.ok) return prepared.response;
  const result = await runEmbedAndSearch(
    prepared.embeddingText,
    prepared.cap,
    prepared.expandedIds,
  );
  return result.ok
    ? buildRagPayload(
      result,
      prepared.expandedIds,
      prepared.expandedLabels,
    )
    : result.response;
}
