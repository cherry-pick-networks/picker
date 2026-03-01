//  Partial score (54) and formative-summative gap (55).

import type {
  FormativeSummativeGapQuery,
  PartialScoreQuery,
} from '#reporting/assessment/extendedSchema.ts';

export async function getPartialScore(
  _q: PartialScoreQuery,
): Promise<{ scores: Record<string, unknown>[] }> {
  await Promise.resolve();
  return { scores: [] };
}

export async function getFormativeSummativeGap(
  _q: FormativeSummativeGapQuery,
): Promise<{ gap: Record<string, unknown> }> {
  await Promise.resolve();
  return { gap: {} };
}
