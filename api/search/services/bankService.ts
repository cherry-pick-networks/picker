import { ContentStores } from '#api/storage/ContentStores.ts';
import type { Item, ItemPatch } from '#api/search/configurations/bankSchema.ts';
import {
  type CreateItemRequest as CreateItemRequestType,
  ItemSchema,
} from '#api/search/configurations/bankSchema.ts';
import { validateItemFacets } from '#api/search/configurations/bankFacetValidation.ts';
import { nowIso, parseItem } from './bankSchemaParseService.ts';

export {
  CreateItemRequestSchema,
  ItemPatchSchema,
  ItemSchema,
} from '#api/search/configurations/bankSchema.ts';
export type {
  CreateItemRequest,
  Item,
  ItemPatch,
} from '#api/search/configurations/bankSchema.ts';

export async function getItem(
  id: string,
): Promise<Item | null> {
  const raw = await ContentStores.itemStore.getItem(id);
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
): Promise<Item> {
  await validateItemFacets(body);
  const item = buildItemRaw(body);
  await ContentStores.itemStore.setItem(
    item as unknown as Record<string, unknown>,
  );
  return item;
}

async function mergeAndSaveItem(
  id: string,
  existing: Item,
  body: ItemPatch,
): Promise<Item> {
  const merged = { ...existing, ...body, item_id: id };
  const item = parseItem(merged);
  await ContentStores.itemStore.setItem(
    item as unknown as Record<string, unknown>,
  );
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
