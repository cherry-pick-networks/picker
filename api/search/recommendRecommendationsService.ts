//
// Unified recommendations: resolve strategy and call semantic/rag/semantic-items.
// Normalizes to a single list (dedup, limit).
//

import type { RecommendationsQuery } from '#api/search/recommendRecommendationsSchema.ts';
import { resolveStrategy } from '#api/search/recommendStrategy.ts';
import type {
  GetRecommendationsResult,
  QueryPrep,
} from '#api/search/recommendation/recommendationsServiceHelpers.ts';
import {
  runRag,
  runSemantic,
  runSemanticAndRag,
  runSemanticItems,
} from '#api/search/recommendation/recommendationsServiceRunners.ts';

const DEFAULT_LIMIT = 10;

export type { GetRecommendationsResult } from '#api/search/recommendation/recommendationsServiceHelpers.ts';

function prepareQuery(
  query: RecommendationsQuery,
): QueryPrep {
  const ctx = query.context ?? {};
  const searchQuery = typeof ctx['query'] === 'string'
    ? (ctx['query'] as string).trim()
    : '';
  const conceptIds = Array.isArray(ctx['concept_ids'])
    ? (ctx['concept_ids'] as string[]).filter((x) =>
      typeof x === 'string'
    )
    : undefined;
  return {
    strategy: resolveStrategy(
      query.intent,
      query.context ?? undefined,
    ),
    limit: query.limit ?? DEFAULT_LIMIT,
    searchQuery,
    conceptIds,
  };
}

export function getRecommendations(
  query: RecommendationsQuery,
): Promise<GetRecommendationsResult> {
  const prep = prepareQuery(query);
  if (prep.strategy === 'semantic_items') {
    return runSemanticItems(prep);
  }
  if (prep.strategy === 'rag') return runRag(prep);
  return prep.strategy === 'semantic_and_rag'
    ? runSemanticAndRag(prep)
    : runSemantic(prep);
}
