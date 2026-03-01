//  Report metrics: partial_score, formative_summative_gap. Used by reportMetricsRunners.

import type { ReportQueryFilters } from '#system/report/query/reportSchema.ts';
import { getPartialScore } from '#system/report/assessment/extendedService.ts';
import {
  getFormativeSummativeGap,
} from '#system/report/assessment/extendedService.ts';

export function runPartialScore(
  f: ReportQueryFilters,
): Promise<unknown> {
  const actorId = f?.actor_id;
  if (!actorId) return Promise.resolve({ scores: [] });
  return getPartialScore({
    actor_id: actorId,
    from: f?.from,
    to: f?.to,
  });
}

export function runFormativeSummativeGap(
  f: ReportQueryFilters,
): Promise<unknown> {
  const actorId = f?.actor_id;
  const schemeId = f?.scheme_id;
  if (!actorId || !schemeId) {
    return Promise.resolve({ gap: {} });
  }
  return getFormativeSummativeGap({
    actor_id: actorId,
    scheme_id: schemeId,
    from: f?.from,
    to: f?.to,
  });
}
