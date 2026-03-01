//  Runs batched report query: metrics in parallel, result keyed by metric.

import type {
  ReportQueryBody,
  ReportQueryResponse,
} from '#system/report/query/reportSchema.ts';
import { getRunner } from '#system/report/query/reportMetrics.ts';

export async function runReportQuery(
  req: ReportQueryBody,
): Promise<ReportQueryResponse> {
  const filters = req.filters ?? {};
  const results = await Promise.all(
    req.metrics.map(async (metric) => {
      const runner = getRunner(metric);
      const value = await runner(filters);
      return { metric, value };
    }),
  );
  return Object.fromEntries(
    results.map(({ metric, value }) => [metric, value]),
  ) as ReportQueryResponse;
}
