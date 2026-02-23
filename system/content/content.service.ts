import type { CreateResult } from "#shared/infra/result.types.ts";
import { validateConceptIds } from "#system/concept/concept.service.ts";
import * as contentStore from "./content.store.ts";
import type {
  CreateItemRequest as CreateItemRequestType,
  Item,
  ItemPatch,
  Worksheet,
} from "./content.schema.ts";
import { ItemSchema, WorksheetSchema } from "./content.schema.ts";
import { nowIso, parseItem } from "./content-parse.service.ts";

const ERROR_INVALID_ITEM = "Invalid item";
const ERROR_UNKNOWN_CONCEPT_ID = "Unknown concept ID";

// function-length-ignore
function collectConceptIdsFromItemBody(body: {
  concept_id?: string;
  subjectIds?: string[];
  contentTypeId?: string;
  cognitiveLevelId?: string;
  contextIds?: string[];
}): string[] {
  const ids: string[] = [
    ...(body.subjectIds ?? []),
    ...(body.contextIds ?? []),
  ];
  if (body.contentTypeId) ids.push(body.contentTypeId);
  if (body.cognitiveLevelId) ids.push(body.cognitiveLevelId);
  if (body.concept_id) ids.push(body.concept_id);
  return ids.filter(Boolean);
}
export {
  BuildBriefingRequestSchema,
  CreateItemRequestSchema,
  CreateSubmissionRequestSchema,
  GenerateWorksheetRequestSchema,
  GradingResultSchema,
  ItemPatchSchema,
  ItemResultSchema,
  ItemSchema,
  SubmissionSchema,
  WorksheetPromptResponseSchema,
  WorksheetSchema,
} from "./content.schema.ts";
export type {
  CreateItemRequest,
  CreateSubmissionRequest,
  GradingResult,
  Item,
  ItemPatch,
  ItemResult,
  Submission,
  Worksheet,
} from "./content.schema.ts";
export { buildBriefingPrompt } from "./content-briefing.service.ts";
export { buildWorksheetPrompt } from "./content-prompt.service.ts";
export { generateWorksheet } from "./content-worksheet.service.ts";
export {
  createSubmission,
  getItemsForWorksheet,
  getSubmission,
  gradeSubmission,
  listSubmissions,
} from "./content-submission.service.ts";

export async function getItem(id: string): Promise<Item | null> {
  const raw = await contentStore.getItem(id);
  if (raw == null) return null;
  const parsed = ItemSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

function buildItemRaw(body: CreateItemRequestType): Item {
  const id = body.item_id ?? crypto.randomUUID();
  const created_at = body.created_at ?? nowIso();
  return parseItem({
    ...body,
    item_id: id,
    created_at,
  });
}

export async function createItem(
  body: CreateItemRequestType,
): Promise<CreateResult<Item>> {
  const ids = collectConceptIdsFromItemBody(body);
  const { invalid } = await validateConceptIds(ids);
  if (invalid.length > 0) {
    const msg = `${ERROR_UNKNOWN_CONCEPT_ID}: ${invalid.join(", ")}`;
    return { ok: false, error: msg };
  }
  try {
    const item = buildItemRaw(body);
    await contentStore.setItem(item as unknown as Record<string, unknown>);
    return { ok: true, data: item };
  } catch {
    return { ok: false, error: ERROR_INVALID_ITEM };
  }
}

async function mergeAndSaveItem(
  id: string,
  existing: Item,
  body: ItemPatch,
): Promise<Item> {
  const merged = { ...existing, ...body, item_id: id };
  const item = parseItem(merged);
  await contentStore.setItem(item as unknown as Record<string, unknown>);
  return item;
}

// function-length-ignore
export async function updateItem(
  id: string,
  body: ItemPatch,
): Promise<CreateResult<Item> | null> {
  const existing = await getItem(id);
  if (existing == null) return null;
  const merged = { ...existing, ...body, item_id: id };
  const ids = collectConceptIdsFromItemBody(merged);
  const { invalid } = await validateConceptIds(ids);
  if (invalid.length > 0) {
    const msg = `${ERROR_UNKNOWN_CONCEPT_ID}: ${invalid.join(", ")}`;
    return { ok: false, error: msg };
  }
  try {
    const item = await mergeAndSaveItem(id, existing, body);
    return { ok: true, data: item };
  } catch {
    return { ok: false, error: ERROR_INVALID_ITEM };
  }
}

export async function getWorksheet(id: string): Promise<Worksheet | null> {
  const raw = await contentStore.getWorksheet(id);
  if (raw == null) return null;
  const parsed = WorksheetSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}
