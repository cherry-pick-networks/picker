/**
 * Source storage in Deno KV. Keys: ["source", id].
 */

import { getKv } from "./kv.ts";

const PREFIX = ["source"] as const;

export async function getSource(id: string): Promise<unknown | null> {
  const kv = await getKv();
  const e = await kv.get([...PREFIX, id]);
  return e.value ?? null;
}

export async function setSource(
  value: Record<string, unknown>,
): Promise<void> {
  const kv = await getKv();
  const id = value.source_id as string;
  if (!id) throw new Error("source_id required");
  await kv.set([...PREFIX, id], value);
}

export async function listSources(): Promise<Record<string, unknown>[]> {
  const kv = await getKv();
  const out: Record<string, unknown>[] = [];
  for await (const entry of kv.list({ prefix: [...PREFIX] })) {
    const v = entry.value as Record<string, unknown>;
    if (v != null) out.push(v);
  }
  return out;
}
