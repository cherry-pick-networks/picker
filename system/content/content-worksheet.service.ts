import * as contentStore from "./content.store.ts";
import type { GenerateWorksheetRequest, Worksheet } from "./content.schema.ts";
import { nowIso } from "./content-parse.service.ts";
import {
  initWorksheetRequest,
  validateAndInitWorksheet,
} from "./content-worksheet-request.ts";

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

async function saveWorksheet(worksheet: Worksheet): Promise<Worksheet> {
  await contentStore.setWorksheet(
    worksheet as unknown as Record<string, unknown>,
  );
  return worksheet;
}

async function resolveItemIds(
  request: GenerateWorksheetRequest,
  init: ReturnType<typeof initWorksheetRequest>,
): Promise<string[]> {
  const item_count = request.item_count ?? 5;
  return request.subject_weights &&
      Object.keys(request.subject_weights).length > 0
    ? await collectItemIdsBySubjectWeights(
      request.subject_weights,
      item_count,
    )
    : await collectItemIds(init.conceptIds, init.perConcept);
}

export async function generateWorksheet(
  request: GenerateWorksheetRequest,
): Promise<Worksheet> {
  const init = await validateAndInitWorksheet(request);
  const item_ids = await resolveItemIds(request, init);
  return saveWorksheet(
    buildWorksheetMeta(request, init.worksheet_id, item_ids),
  );
}
