//  Missing-link predictor (56) and ontology versioning (58).

import type {
  MissingLinkPredictorQuery,
  OntologyVersioningQuery,
} from '#api/config/ontologySuggestSchema.ts';

export async function getMissingLinkPredictor(
  _q: MissingLinkPredictorQuery,
): Promise<{ suggestions: Record<string, unknown>[] }> {
  await Promise.resolve();
  return { suggestions: [] };
}

//  Stub or empty when no mapping table (per spec).
export async function getOntologyVersioning(
  _q: OntologyVersioningQuery,
): Promise<{ versions: Record<string, unknown>[] }> {
  await Promise.resolve();
  return { versions: [] };
}
