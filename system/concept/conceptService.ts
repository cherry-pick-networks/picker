/** Concept validation: facet IDs must belong to designated scheme(s). */

import { type FacetName, getAllowedSchemeIds } from './conceptSchemes.ts';
import * as conceptStore from './conceptStore.ts';

export const ID_COUNT_LIMIT = 500;

export async function validateFacetSchemes(
  facet: FacetName,
  ids: string[],
): Promise<{ invalid: string[] }> {
  if (ids.length > ID_COUNT_LIMIT) return { invalid: ids };
  const allowedSchemeIds = getAllowedSchemeIds(facet);
  const existing = await conceptStore.getExistingConceptIdsBySchemes(
    ids,
    allowedSchemeIds,
  );
  return { invalid: ids.filter((id) => !existing.has(id)) };
}
