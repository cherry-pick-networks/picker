import * as contentStore from "../store/content.ts";
import type { Item, ItemPatch, Worksheet } from "../schema/content-schema.ts";
import {
  type CreateItemRequest as CreateItemRequestType,
  ItemSchema,
  WorksheetSchema,
} from "../schema/content-schema.ts";
import { nowIso, parseItem } from "./content-parse.ts";
export {
  CreateItemRequestSchema,
  GenerateWorksheetRequestSchema,
  ItemPatchSchema,
  ItemSchema,
  WorksheetPromptResponseSchema,
  WorksheetSchema,
} from "../schema/content-schema.ts";
export type {
  CreateItemRequest,
  Item,
  ItemPatch,
  Worksheet,
} from "../schema/content-schema.ts";
export { buildWorksheetPrompt } from "./content-prompt.ts";
export { generateWorksheet } from "./content-worksheet.ts";

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

export async function updateItem(
  id: string,
  body: ItemPatch,
): Promise<Item | null> {
  const existing = await getItem(id);
  if (existing == null) return null;
  return mergeAndSaveItem(id, existing, body);
}

export async function getWorksheet(id: string): Promise<Worksheet | null> {
  const raw = await contentStore.getWorksheet(id);
  if (raw == null) return null;
  const parsed = WorksheetSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}
