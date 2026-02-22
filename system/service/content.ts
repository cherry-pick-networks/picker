// deno-lint-ignore-file function-length/function-length
import * as contentStore from "../store/content.ts";
import type { Item, ItemPatch, Worksheet } from "./content-schema.ts";
import {
  ItemSchema,
  WorksheetSchema,
  type CreateItemRequest as CreateItemRequestType,
  type GenerateWorksheetRequest,
} from "./content-schema.ts";
import { nowIso, parseItem } from "./content-parse.ts";
export {
  ItemSchema,
  WorksheetSchema,
  CreateItemRequestSchema,
  GenerateWorksheetRequestSchema,
  WorksheetPromptResponseSchema,
  ItemPatchSchema,
} from "./content-schema.ts";
export type { Item, Worksheet, CreateItemRequest, ItemPatch } from "./content-schema.ts";
export { buildWorksheetPrompt } from "./content-prompt.ts";

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

export async function createItem(body: CreateItemRequestType): Promise<Item> {
  const item = buildItemRaw(body);
  await contentStore.setItem(item as unknown as Record<string, unknown>);
  return item;
}

export async function updateItem(
  id: string,
  body: ItemPatch,
): Promise<Item | null> {
  const existing = await getItem(id);
  if (existing == null) return null;
  const merged = { ...existing, ...body, item_id: id };
  const item = parseItem(merged);
  await contentStore.setItem(item as unknown as Record<string, unknown>);
  return item;
}

export async function getWorksheet(id: string): Promise<Worksheet | null> {
  const raw = await contentStore.getWorksheet(id);
  if (raw == null) return null;
  const parsed = WorksheetSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export async function generateWorksheet(
  request: GenerateWorksheetRequest,
): Promise<Worksheet> {
  const worksheet_id = crypto.randomUUID();
  const item_ids: string[] = [];
  const conceptIds = request.concept_ids?.length ? request.concept_ids : [];
  const perConcept = Math.max(
    1,
    Math.floor((request.item_count ?? 5) / Math.max(1, conceptIds.length)),
  );
  for (const cid of conceptIds) {
    const items = await contentStore.listItemsByConcept(cid);
    for (let i = 0; i < perConcept && i < items.length; i++) {
      const it = items[i];
      const id = it?.item_id as string;
      if (id) item_ids.push(id);
    }
  }
  const worksheet: Worksheet = {
    worksheet_id,
    title: request.title ?? `Worksheet ${worksheet_id.slice(0, 8)}`,
    item_ids,
    generated_at: nowIso(),
    metadata: { concept_ids: conceptIds },
  };
  await contentStore.setWorksheet(
    worksheet as unknown as Record<string, unknown>,
  );
  return worksheet;
}
