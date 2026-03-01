//  Cohort weakness heatmap: concept × actor pass rates for Excel.

import { ReportStores } from '#system/report/ReportStores.ts';

export interface CohortWeaknessHeatmapInput {
  actor_ids: string[];
  scheme_id: string;
  from?: string;
  to?: string;
}

export async function buildCohortWeaknessHeatmap(
  input: CohortWeaknessHeatmapInput,
) {
  const rows = await ReportStores.cohortWeaknessHeatmapStore
    .getCohortWeaknessHeatmap(
      input.actor_ids,
      input.scheme_id,
      input.from,
      input.to,
    );
  return {
    rows: rows.map((r) => ({
      actor_id: r.actor_id,
      code: r.code,
      pass_count: r.pass_count,
      total: r.total,
      pass_rate: r.total > 0 ? r.pass_count / r.total : 0,
    })),
  };
}
