import * as contentStore from './contentStore.ts';
import type { Item, ItemPatch, Worksheet } from './contentSchema.ts';
import {
  type CreateItemRequest as CreateItemRequestType,
  ItemSchema,
  WorksheetSchema,
} from './contentSchema.ts';
import { validateItemFacets } from './contentFacetValidation.ts';
import { nowIso, parseItem } from './contentSchemaParseService.ts';
export {
  CreateItemRequestSchema,
  CreateWorksheetRequestSchema,
  GenerateWorksheetRequestSchema,
  ItemPatchSchema,
  ItemSchema,
  WorksheetPromptResponseSchema,
  WorksheetSchema,
} from './contentSchema.ts';
export type {
  CreateItemRequest,
  CreateWorksheetRequest,
  Item,
  ItemPatch,
  Worksheet,
} from './contentSchema.ts';
export { buildWorksheetPrompt } from './contentPromptService.ts';
export { createWorksheet } from './contentWorksheetService.ts';

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
  await validateItemFacets(body);
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
  await validateItemFacets(body);
  return mergeAndSaveItem(id, existing, body);
}

export async function getWorksheet(id: string): Promise<Worksheet | null> {
  const raw = await contentStore.getWorksheet(id);
  if (raw == null) return null;
  const parsed = WorksheetSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}
