/** Concept validation: facet IDs must belong to designated scheme. */

import * as conceptStore from "./concept.store.ts";

const ID_COUNT_LIMIT = 500;

export async function validateFacetSchemes(
  ids: string[],
  allowedScheme: string,
): Promise<void> {
  if (ids.length > ID_COUNT_LIMIT) {
    throw new Error(`ID count exceeds limit of ${ID_COUNT_LIMIT}`);
  }
  const valid = await conceptStore.checkIdsInScheme(ids, allowedScheme);
  if (!valid) {
    throw new Error(`Invalid IDs for scheme: ${allowedScheme}`);
  }
}
