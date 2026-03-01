import { ReportStores } from '#reporting/app/ReportStores.ts';

export interface NodeDensityScoreInput {
  actor_id?: string;
  scheme_id: string;
  from?: string;
  to?: string;
}

export async function buildNodeDensityScore(
  input: NodeDensityScoreInput,
) {
  const rows = await ReportStores.nodeDensityStore
    .getNodeDensity(
      input.scheme_id,
      input.from,
      input.to,
    );
  const totalOutcomes = rows.reduce(
    (s, r) => s + r.outcome_count,
    0,
  );
  const score = rows.length > 0
    ? totalOutcomes / rows.length
    : 0;
  return {
    score,
    by_concept: rows.map((r) => ({
      concept_id: r.code,
      outcome_count: r.outcome_count,
    })),
  };
}
