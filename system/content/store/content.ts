/** Content storage in Deno KV. Keys: ["content","item"|"worksheet", id]. */

import { getKv } from "../../kv/store/kv.ts";

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

function maybePushItem(
  out: Record<string, unknown>[],
  v: Record<string, unknown>,
  conceptId: string,
): void {
  if (v?.concept_id !== conceptId) return;
  out.push(v);
}

async function collectItemsByConcept(
  kv: Awaited<ReturnType<typeof getKv>>,
  conceptId: string,
): Promise<Record<string, unknown>[]> {
  const out: Record<string, unknown>[] = [];
  for await (const entry of kv.list({ prefix: [...ITEM_PREFIX] })) {
    maybePushItem(out, entry.value as Record<string, unknown>, conceptId);
  }
  return out;
}

export async function listItemsByConcept(
  conceptId: string,
): Promise<Record<string, unknown>[]> {
  const kv = await getKv();
  return collectItemsByConcept(kv, conceptId);
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
