import { ReportStores } from '#system/report/ReportStores.ts';

export interface StudyTimeRoiInput {
  actor_ids: string[];
  scheme_id: string;
  from?: string;
  to?: string;
}

type StudyTimeRoiRow = Awaited<
  ReturnType<
    typeof ReportStores.studyTimeRoiStore.getStudyTimeRoi
  >
>[0];

function toMetrics(
  rows: StudyTimeRoiRow[],
): {
  actor_id: string;
  response_count: number;
  pass_count: number;
  pass_rate: number;
}[] {
  const metrics = rows.map((r) => ({
    actor_id: r.actor_id,
    response_count: r.response_count,
    pass_count: r.pass_count,
    pass_rate: r.response_count > 0
      ? r.pass_count / r.response_count
      : 0,
  }));
  return metrics;
}

function correlationFromMeans(
  metrics: { response_count: number; pass_count: number }[],
  meanX: number,
  meanY: number,
): number {
  let num = 0;
  let denX = 0;
  for (const m of metrics) {
    num += (m.response_count - meanX) *
      (m.pass_count - meanY);
    denX += (m.response_count - meanX) ** 2;
  }
  return denX > 0 ? num / Math.sqrt(denX) : 0;
}

function computeCorrelation(
  metrics: { response_count: number; pass_count: number }[],
): number {
  const n = metrics.length;
  const sumX = metrics.reduce(
    (s, m) => s + m.response_count,
    0,
  );
  const sumY = metrics.reduce(
    (s, m) => s + m.pass_count,
    0,
  );
  return correlationFromMeans(
    metrics,
    n > 0 ? sumX / n : 0,
    n > 0 ? sumY / n : 0,
  );
}

export async function buildStudyTimeRoi(
  input: StudyTimeRoiInput,
) {
  const rows = await ReportStores.studyTimeRoiStore
    .getStudyTimeRoi(
      input.actor_ids,
      input.scheme_id,
      input.from,
      input.to,
    );
  const metrics = toMetrics(rows);
  const correlation = computeCorrelation(metrics);
  return { metrics, correlation };
}
