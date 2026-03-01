//  Plagiarism anomaly (53); report/anomaly extension.

import type { PlagiarismQuery } from '#reporting/config/plagiarism/schema.ts';

export async function getPlagiarismAnomaly(
  _q: PlagiarismQuery,
): Promise<{
  anomalies: Array<
    { actor_id: string; kind: string; message?: string }
  >;
}> {
  await Promise.resolve();
  return { anomalies: [] };
}
