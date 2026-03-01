//  Auto-tag confidence (59).

import type { AutoTagConfidenceQuery } from './autoTagConfidenceSchema.ts';

export async function getAutoTagConfidence(
  _q: AutoTagConfidenceQuery,
): Promise<{ confidence: Record<string, unknown>[] }> {
  await Promise.resolve();
  return { confidence: [] };
}
