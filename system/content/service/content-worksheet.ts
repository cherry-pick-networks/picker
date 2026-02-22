import * as contentStore from "../store/content.ts";
import type {
  GenerateWorksheetRequest,
  Worksheet,
} from "../schema/content-schema.ts";
import { nowIso } from "./content-parse.ts";

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
  const { worksheet_id, conceptIds, perConcept } = initWorksheetRequest(
    request,
  );
  const item_ids = await collectItemIds(conceptIds, perConcept);
  const worksheet = buildWorksheetMeta(request, worksheet_id, item_ids);
  return saveWorksheet(worksheet);
}
