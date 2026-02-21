/**
 * Content storage: items and worksheets in Deno KV.
 * Keys: ["content", "item", id], ["content", "worksheet", id].
 */

import { getKv } from "./kv.ts";

const ITEM_PREFIX = ["content", "item"] as const;
const WORKSHEET_PREFIX = ["content", "worksheet"] as const;

export async function getItem(id: string): Promise<unknown | null> {
  const kv = await getKv();
  const e = await kv.get([...ITEM_PREFIX, id]);
  return e.value ?? null;
}

export async function setItem(value: Record<string, unknown>): Promise<void> {
  const kv = await getKv();
  const id = value.item_id as string;
  if (!id) throw new Error("item_id required");
  await kv.set([...ITEM_PREFIX, id], value);
}

export async function listItemsByConcept(
  conceptId: string,
): Promise<Record<string, unknown>[]> {
  const kv = await getKv();
  const out: Record<string, unknown>[] = [];
  for await (const entry of kv.list({ prefix: [...ITEM_PREFIX] })) {
    const v = entry.value as Record<string, unknown>;
    if (v?.concept_id === conceptId) out.push(v);
  }
  return out;
}

export async function getWorksheet(id: string): Promise<unknown | null> {
  const kv = await getKv();
  const e = await kv.get([...WORKSHEET_PREFIX, id]);
  return e.value ?? null;
}

export async function setWorksheet(
  value: Record<string, unknown>,
): Promise<void> {
  const kv = await getKv();
  const id = value.worksheet_id as string;
  if (!id) throw new Error("worksheet_id required");
  await kv.set([...WORKSHEET_PREFIX, id], value);
}
