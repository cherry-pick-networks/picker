//  Report metrics: filter→runner. Used by reportMetrics.ts.

import type {
  ReportQueryFilters,
  ReportQueryMetric,
} from '#system/report/query/reportSchema.ts';
import {
  runFormativeSummativeGap,
  runPartialScore,
} from './reportMetricsRunnersAssessment.ts';
import {
  runBottlenecks,
  runCohortWeaknessHeatmap,
  runCurriculumBottleneck,
  runPacingDeviation,
  runPlagiarism,
} from './reportMetricsRunnersAnalytics.ts';

export type ReportMetricRunner = (
  filters: ReportQueryFilters,
) => Promise<unknown>;

export const RUNNERS: Record<
  ReportQueryMetric,
  ReportMetricRunner
> = {
  partial_score: runPartialScore,
  formative_summative_gap: runFormativeSummativeGap,
  plagiarism: runPlagiarism,
  bottlenecks: runBottlenecks,
  cohort_weakness_heatmap: runCohortWeaknessHeatmap,
  pacing_deviation: runPacingDeviation,
  curriculum_bottleneck: runCurriculumBottleneck,
};

export function getRunner(
  metric: ReportQueryMetric,
): ReportMetricRunner {
  return RUNNERS[metric];
}
