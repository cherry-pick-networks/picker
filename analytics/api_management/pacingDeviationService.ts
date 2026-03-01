import { ReportStores } from '#reporting/app/ReportStores.ts';

export interface PacingDeviationInput {
  actor_id: string;
  scheme_id: string;
  from?: string;
  to?: string;
}

export async function buildPacingDeviation(
  input: PacingDeviationInput,
) {
  const rows = await ReportStores.pacingDeviationStore
    .getPacingDeviation(
      input.actor_id,
      input.scheme_id,
      input.from,
      input.to,
    );
  return {
    deviations: rows.map((r) => ({
      concept_code: r.code,
      actual_at: r.first_at.toISOString(),
    })),
  };
}
