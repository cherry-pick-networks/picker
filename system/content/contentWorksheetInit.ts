import {
  ALLOWLIST_ID_COUNT_LIMIT,
  allowlistHas,
  type FacetName,
} from '#shared/contract/allowlistTypes.ts';
import { getAllowlistDataOrLoad } from '#shared/contract/allowlistData.ts';
import type { GenerateWorksheetRequest } from './contentSchema.ts';

export function initWorksheetRequest(request: GenerateWorksheetRequest) {
  const conceptIds = request.concept_ids?.length ? request.concept_ids : [];
  const perConcept = Math.max(
    1,
    Math.floor((request.item_count ?? 5) / Math.max(1, conceptIds.length)),
  );
  return { worksheet_id: crypto.randomUUID(), conceptIds, perConcept };
}

async function assertWorksheetConceptIds(conceptIds: string[]): Promise<void> {
  if (conceptIds.length > ALLOWLIST_ID_COUNT_LIMIT) {
    throw new Error(
      `Too many concept IDs (max ${ALLOWLIST_ID_COUNT_LIMIT})`,
    );
  }
  const data = await getAllowlistDataOrLoad();
  const invalid = conceptIds.filter(
    (id) => !allowlistHas(data, 'concept' as FacetName, id),
  );
  if (invalid.length > 0) {
    throw new Error(`Invalid concept IDs: ${invalid.join(', ')}`);
  }
}

export async function validateAndInitWorksheet(
  request: GenerateWorksheetRequest,
) {
  const conceptIds = request.concept_ids?.length ? request.concept_ids : [];
  await assertWorksheetConceptIds(conceptIds);
  return initWorksheetRequest(request);
}
