//  POST /report/query: request/response for batched report metrics.

import { z } from '@hono/zod-openapi';

export const REPORT_QUERY_METRICS = [
  'partial_score',
  'formative_summative_gap',
  'plagiarism',
  'bottlenecks',
  'cohort_weakness_heatmap',
  'pacing_deviation',
  'curriculum_bottleneck',
] as const;

export type ReportQueryMetric =
  (typeof REPORT_QUERY_METRICS)[number];

export const ReportQueryMetricsSchema = z
  .array(z.enum(REPORT_QUERY_METRICS))
  .min(1, 'metrics must have at least one value');

export const ReportQueryFiltersSchema = z.object({
  actor_id: z.string().optional(),
  actor_ids: z.union([z.array(z.string()), z.string()])
    .optional(),
  scheme_id: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  class_id: z.string().optional(),
});

export const ReportQueryBodySchema = z.object({
  metrics: ReportQueryMetricsSchema,
  filters: ReportQueryFiltersSchema.optional(),
});

export type ReportQueryBody = z.infer<
  typeof ReportQueryBodySchema
>;
export type ReportQueryFilters = z.infer<
  typeof ReportQueryFiltersSchema
>;

export const ReportQueryResponseSchema = z
  .record(z.string(), z.unknown())
  .openapi('ReportQueryResponse');

export type ReportQueryResponse = z.infer<
  typeof ReportQueryResponseSchema
>;
