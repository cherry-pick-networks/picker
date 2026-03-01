import { ReportStores } from '#reporting/ReportStores.ts';

export interface MasteryTrajectoryInput {
  actor_id: string;
  scheme_id: string;
  from?: string;
  to?: string;
}

export async function buildMasteryTrajectory(
  input: MasteryTrajectoryInput,
) {
  const rows = await ReportStores.masteryTrajectoryStore
    .getMasteryTrajectory(
      input.actor_id,
      input.scheme_id,
      input.from,
      input.to,
    );
  return {
    points: rows.map((r) => ({
      date: r.day,
      mastery_score: r.total > 0
        ? r.pass_count / r.total
        : 0,
      pass_count: r.pass_count,
      total: r.total,
    })),
  };
}
