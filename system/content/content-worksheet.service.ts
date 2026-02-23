import type { CreateResult } from "#shared/infra/result.types.ts";
import { validateConceptIds } from "#system/concept/concept.service.ts";
import * as contentStore from "./content.store.ts";
import type { GenerateWorksheetRequest, Worksheet } from "./content.schema.ts";
import { nowIso } from "./content-parse.service.ts";

const ERROR_GENERATE_FAILED = "Generate failed";
const ERROR_UNKNOWN_CONCEPT_ID = "Unknown concept ID";

function collectConceptIdsFromRequest(
  request: GenerateWorksheetRequest,
): string[] {
  const ids = [
    ...(request.concept_ids ?? []),
    ...(request.subjectIds ?? []),
    ...(request.contextIds ?? []),
  ];
  if (request.contentTypeId) ids.push(request.contentTypeId);
  if (request.cognitiveLevelId) ids.push(request.cognitiveLevelId);
  return ids.filter(Boolean);
}

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

function worksheetMetadata(
  request: GenerateWorksheetRequest,
  generated_at: string,
): Record<string, unknown> {
  const conceptIds = request.concept_ids?.length ? request.concept_ids : [];
  const date_iso = request.date_iso ?? generated_at.slice(0, 10);
  return {
    concept_ids: conceptIds,
    date_iso,
    ...(request.session_id != null && { session_id: request.session_id }),
    ...(request.sheet_label != null && { sheet_label: request.sheet_label }),
  };
}

function buildWorksheetMeta(
  request: GenerateWorksheetRequest,
  worksheet_id: string,
  item_ids: string[],
): Worksheet {
  const generated_at = nowIso();
  const title = request.title ?? `Worksheet ${worksheet_id.slice(0, 8)}`;
  const metadata = worksheetMetadata(request, generated_at);
  return {
    worksheet_id,
    title,
    item_ids,
    subjectIds: request.subjectIds ?? [],
    contentTypeId: request.contentTypeId,
    cognitiveLevelId: request.cognitiveLevelId,
    contextIds: request.contextIds ?? [],
    generated_at,
    metadata,
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
): Promise<CreateResult<Worksheet>> {
  const ids = collectConceptIdsFromRequest(request);
  const { invalid } = await validateConceptIds(ids);
  if (invalid.length > 0) {
    const msg = `${ERROR_UNKNOWN_CONCEPT_ID}: ${invalid.join(", ")}`;
    return { ok: false, error: msg };
  }
  try {
    const { worksheet_id, conceptIds, perConcept } = initWorksheetRequest(
      request,
    );
    const item_ids = await collectItemIds(conceptIds, perConcept);
    const worksheet = buildWorksheetMeta(request, worksheet_id, item_ids);
    const saved = await saveWorksheet(worksheet);
    return { ok: true, data: saved };
  } catch {
    return { ok: false, error: ERROR_GENERATE_FAILED };
  }
}
