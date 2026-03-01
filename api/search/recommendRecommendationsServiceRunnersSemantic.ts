//  Runners: runSemanticAndRag, runSemantic. Used by recommendationsServiceRunners.

import { recommendRag } from '#api/search/recommendRagService.ts';
import { recommend } from '#api/search/recommendSemanticService.ts';
import type {
  GetRecommendationsResult,
  QueryPrep,
} from '#api/search/recommendRecommendationsServiceHelpers.ts';
import {
  mergeSemanticRag,
  toContent,
} from '#api/search/recommendRecommendationsServiceHelpers.ts';

export async function runSemanticAndRag(
  prep: QueryPrep,
): Promise<GetRecommendationsResult> {
  if (!prep.searchQuery) {
    return {
      ok: false,
      status: 400,
      message: 'context.query required',
    };
  }
  const [sem, rag] = await Promise.all([
    recommend(
      prep.searchQuery,
      prep.conceptIds,
      prep.limit,
    ),
    recommendRag(
      prep.searchQuery,
      prep.conceptIds,
      true,
      prep.limit,
    ),
  ]);
  return {
    ok: true,
    recommendations: mergeSemanticRag(sem, rag, prep.limit),
  };
}

export async function runSemantic(
  prep: QueryPrep,
): Promise<GetRecommendationsResult> {
  if (!prep.searchQuery) {
    return {
      ok: false,
      status: 400,
      message: 'context.query required',
    };
  }
  const out = await recommend(
    prep.searchQuery,
    prep.conceptIds,
    prep.limit,
  );
  if (!out.ok) {
    return {
      ok: false,
      status: out.status,
      message: out.message,
    };
  }
  return {
    ok: true,
    recommendations: toContent(out.recommendations),
  };
}
