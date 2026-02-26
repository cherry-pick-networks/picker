import {
  ID_COUNT_LIMIT,
  validateFacetSchemes,
} from "#system/concept/concept.service.ts";
import * as contentStore from "./content.store.ts";
import type { GenerateWorksheetRequest, Worksheet } from "./content.schema.ts";
import { nowIso } from "./content-parse.service.ts";

async function collectItemIds(
  conceptIds: string[],
  perConcept: number,
): Promise<string[]> {
  const item_ids: string[] = [];
  for (const cid of conceptIds) {
    const items = await contentStore.listItemsByConcept(cid);
    for (let i = 0; i < perConcept && i < items.length; i++) {
      const id = items[i]?.item_id as string;
      if (id) item_ids.push(id);
    }
  }
  return item_ids;
}

async function collectItemIdsBySubjectWeights(
  subjectWeights: Record<string, number>,
  itemCount: number,
): Promise<string[]> {
  const all: string[] = [];
  for (const [subjectId, weight] of Object.entries(subjectWeights)) {
    const target = Math.round(itemCount * weight);
    if (target <= 0) continue;
    const items = await contentStore.listItemsByConcept(subjectId);
    for (let i = 0; i < target && i < items.length; i++) {
      const id = items[i]?.item_id as string;
      if (id) all.push(id);
    }
  }
  return all.slice(0, itemCount);
}

function buildWorksheetMeta(
  request: GenerateWorksheetRequest,
  worksheet_id: string,
  item_ids: string[],
): Worksheet {
  const conceptIds = request.concept_ids?.length ? request.concept_ids : [];
  const title = request.title ?? `Worksheet ${worksheet_id.slice(0, 8)}`;
  return {
    worksheet_id,
    title,
    item_ids,
    generated_at: nowIso(),
    metadata: { concept_ids: conceptIds },
  };
}

function initWorksheetRequest(request: GenerateWorksheetRequest) {
  const conceptIds = request.concept_ids?.length ? request.concept_ids : [];
  const perConcept = Math.max(
    1,
    Math.floor((request.item_count ?? 5) / Math.max(1, conceptIds.length)),
  );
  return { worksheet_id: crypto.randomUUID(), conceptIds, perConcept };
}

async function saveWorksheet(worksheet: Worksheet): Promise<Worksheet> {
  await contentStore.setWorksheet(
    worksheet as unknown as Record<string, unknown>,
  );
  return worksheet;
}

export async function generateWorksheet(
  request: GenerateWorksheetRequest,
): Promise<Worksheet> {
  const conceptIds = request.concept_ids?.length ? request.concept_ids : [];
  if (conceptIds.length > ID_COUNT_LIMIT) {
    throw new Error(
      `Too many concept IDs in request (max ${ID_COUNT_LIMIT})`,
    );
  }
  const { invalid } = await validateFacetSchemes("concept", conceptIds);
  if (invalid.length > 0) {
    throw new Error(`Invalid concept IDs: ${invalid.join(", ")}`);
  }
  const { worksheet_id, conceptIds: ids, perConcept } = initWorksheetRequest(
    request,
  );
  const item_count = request.item_count ?? 5;
  const item_ids = request.subject_weights &&
      Object.keys(request.subject_weights).length > 0
    ? await collectItemIdsBySubjectWeights(
      request.subject_weights,
      item_count,
    )
    : await collectItemIds(ids, perConcept);
  const worksheet = buildWorksheetMeta(request, worksheet_id, item_ids);
  return saveWorksheet(worksheet);
}
