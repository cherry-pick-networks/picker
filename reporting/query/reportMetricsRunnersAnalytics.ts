//  Report metrics: plagiarism, bottlenecks, heatmap, pacing. Used by reportMetricsRunners.

import type { ReportQueryFilters } from '#reporting/query/reportSchema.ts';
import { getPlagiarismAnomaly } from '#reporting/plagiarism/service.ts';
import { getBottleneckNodes } from '#analytics/datafactory/bottleneckService.ts';
import {
  buildCohortWeaknessHeatmap,
} from '#analytics/config/cohortWeaknessHeatmapService.ts';
import { buildPacingDeviation } from '#analytics/apimanagement/pacingDeviationService.ts';

export function toActorIds(
  f: ReportQueryFilters,
): string[] | undefined {
  const a = f?.actor_ids;
  if (a == null) {
    return f?.actor_id ? [f.actor_id] : undefined;
  }
  return Array.isArray(a)
    ? a
    : a.split(',').filter(Boolean);
}

export function runPlagiarism(
  f: ReportQueryFilters,
): Promise<unknown> {
  const ids = toActorIds(f ?? {});
  return getPlagiarismAnomaly({
    actor_ids: ids?.length ? ids.join(',') : undefined,
    from: f?.from,
    to: f?.to,
  });
}

export function runBottlenecks(
  f: ReportQueryFilters,
): Promise<unknown> {
  const ids = toActorIds(f ?? {});
  const schemeId = f?.scheme_id;
  if (!ids?.length || !schemeId) {
    return Promise.resolve({ nodes: [] });
  }
  return getBottleneckNodes({
    actor_ids: ids,
    scheme_id: schemeId,
    from: f?.from,
    to: f?.to,
  }).then((nodes) => ({ nodes }));
}

export function runCohortWeaknessHeatmap(
  f: ReportQueryFilters,
): Promise<unknown> {
  const ids = toActorIds(f ?? {});
  const schemeId = f?.scheme_id;
  if (!ids?.length || !schemeId) {
    return Promise.resolve({ rows: [] });
  }
  return buildCohortWeaknessHeatmap({
    actor_ids: ids,
    scheme_id: schemeId,
    from: f?.from,
    to: f?.to,
  });
}

export function runPacingDeviation(
  f: ReportQueryFilters,
): Promise<unknown> {
  const actorId = f?.actor_id;
  const schemeId = f?.scheme_id;
  if (!actorId || !schemeId) {
    return Promise.resolve({ deviations: [] });
  }
  return buildPacingDeviation({
    actor_id: actorId,
    scheme_id: schemeId,
    from: f?.from,
    to: f?.to,
  });
}

export function runCurriculumBottleneck(
  f: ReportQueryFilters,
): Promise<unknown> {
  return runBottlenecks(f);
}
