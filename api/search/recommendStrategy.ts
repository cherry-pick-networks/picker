//
// Resolves which recommend backend(s) to use from intent and context.
//

import type { Intent } from '#api/search/recommendRecommendationsSchema.ts';

export type RecommendStrategy =
  | 'semantic'
  | 'rag'
  | 'semantic_items'
  | 'semantic_and_rag';

function defaultStrategy(
  expand: boolean,
): RecommendStrategy {
  return expand ? 'semantic_and_rag' : 'semantic';
}

export function resolveStrategy(
  intent: Intent,
  context?: Record<string, unknown> | null,
): RecommendStrategy {
  const expand = context &&
    context['expand_concepts'] === true;
  if (intent === 'exam_prep') return 'rag';
  if (intent === 'practice') return 'semantic_items';
  return defaultStrategy(expand === true);
}
