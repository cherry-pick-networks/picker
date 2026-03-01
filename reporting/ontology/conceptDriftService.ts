//  Concept drift (57).

import type { ConceptDriftQuery } from '#reporting/ontology/conceptDriftSchema.ts';

export async function getConceptDrift(
  _q: ConceptDriftQuery,
): Promise<{ drift: Record<string, unknown>[] }> {
  await Promise.resolve();
  return { drift: [] };
}
