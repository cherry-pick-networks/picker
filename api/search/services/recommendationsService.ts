//
// Unified recommendations: resolve strategy and call semantic/rag/semantic-items.
// Normalizes to a single list (dedup, limit).
//

import { distinct } from '@std/collections/distinct';
import type { RecommendationsQuery } from '#api/search/configurations/recommendationsSchema.ts';
import { resolveStrategy } from '#api/search/configurations/strategy.ts';
import type {
  GetRecommendationsResult,
  QueryPrep,
} from './recommendationsServiceHelpers.ts';
import {
  runRag,
  runSemantic,
  runSemanticAndRag,
  runSemanticItems,
} from '#api/search/runs/recommendationsServiceRunners.ts';

const DEFAULT_LIMIT = 10;

export type { GetRecommendationsResult } from './recommendationsServiceHelpers.ts';

function prepareQuery(
  query: RecommendationsQuery,
): QueryPrep {
  const ctx = query.context ?? {};
  const searchQuery = typeof ctx['query'] === 'string'
    ? (ctx['query'] as string).trim()
    : '';
  const raw = Array.isArray(ctx['concept_ids'])
    ? (ctx['concept_ids'] as string[]).filter((x) =>
      typeof x === 'string'
    )
    : [];
  const conceptIds = raw.length > 0
    ? distinct(raw)
    : undefined;
  return {
    strategy: resolveStrategy(
      query.intent,
      query.context ?? undefined,
    ),
    limit: query.limit ?? DEFAULT_LIMIT,
    searchQuery,
    conceptIds: conceptIds?.length ? conceptIds : undefined,
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
