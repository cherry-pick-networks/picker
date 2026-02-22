/**
 * Source storage in Deno KV. Keys: ["source", id].
 */

import { getKv } from "#shared/infra/kv.client.ts";

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

function maybePushSource(
  out: Record<string, unknown>[],
  v: Record<string, unknown> | null,
): void {
  if (v == null) return;
  out.push(v);
}

async function collectSources(
  kv: Awaited<ReturnType<typeof getKv>>,
): Promise<Record<string, unknown>[]> {
  const out: Record<string, unknown>[] = [];
  for await (const entry of kv.list({ prefix: [...PREFIX] })) {
    maybePushSource(out, entry.value as Record<string, unknown> | null);
  }
  return out;
}

export async function listSources(): Promise<Record<string, unknown>[]> {
  const kv = await getKv();
  return collectSources(kv);
}
