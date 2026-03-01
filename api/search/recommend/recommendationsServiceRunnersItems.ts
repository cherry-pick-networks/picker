//  Runners: runSemanticItems, runRag. Used by recommendationsServiceRunners.

import { recommendRag } from './ragService.ts';
import { recommendItems } from './semanticItemService.ts';
import type {
  GetRecommendationsResult,
  QueryPrep,
} from './recommendationsServiceHelpers.ts';
import {
  toContent,
  toItem,
} from './recommendationsServiceHelpers.ts';

export async function runSemanticItems(
  prep: QueryPrep,
): Promise<GetRecommendationsResult> {
  if (!prep.searchQuery) {
    return {
      ok: false,
      status: 400,
      message: 'context.query required',
    };
  }
  const out = await recommendItems(
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
    recommendations: toItem(out.recommendations),
  };
}

export async function runRag(
  prep: QueryPrep,
): Promise<GetRecommendationsResult> {
  if (!prep.searchQuery) {
    return {
      ok: false,
      status: 400,
      message: 'context.query required',
    };
  }
  const out = await recommendRag(
    prep.searchQuery,
    prep.conceptIds,
    true,
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
