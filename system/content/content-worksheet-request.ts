import {
  ID_COUNT_LIMIT,
  validateFacetSchemes,
} from "#system/concept/concept.service.ts";
import type { GenerateWorksheetRequest } from "./content.schema.ts";

export function initWorksheetRequest(request: GenerateWorksheetRequest) {
  const conceptIds = request.concept_ids?.length ? request.concept_ids : [];
  const perConcept = Math.max(
    1,
    Math.floor((request.item_count ?? 5) / Math.max(1, conceptIds.length)),
  );
  return { worksheet_id: crypto.randomUUID(), conceptIds, perConcept };
}

async function assertWorksheetConceptIds(conceptIds: string[]): Promise<void> {
  if (conceptIds.length > ID_COUNT_LIMIT) {
    throw new Error(
      `Too many concept IDs in request (max ${ID_COUNT_LIMIT})`,
    );
  }
  const { invalid } = await validateFacetSchemes("concept", conceptIds);
  if (invalid.length > 0) {
    throw new Error(`Invalid concept IDs: ${invalid.join(", ")}`);
  }
}

export async function validateAndInitWorksheet(
  request: GenerateWorksheetRequest,
) {
  const conceptIds = request.concept_ids?.length ? request.concept_ids : [];
  await assertWorksheetConceptIds(conceptIds);
  return initWorksheetRequest(request);
}
