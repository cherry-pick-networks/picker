/** KV under prefix ["kv"]; logical key part only (e.g. "foo"). */
let kvPromise: Promise<Deno.Kv> | null = null;

export function getKv(): Promise<Deno.Kv> {
  if (!kvPromise) kvPromise = Deno.openKv();
  return kvPromise;
}

function toLogicalKey(keyParts: string[]): string | null {
  if (keyParts.length < 2 || keyParts[0] !== "kv") return null;
  return keyParts.slice(1).join("/");
}

function pushValidKey(keys: string[], entry: Deno.KvEntry<unknown>): void {
  const key = toLogicalKey(entry.key as string[]);
  if (key !== null) keys.push(key);
}

async function collectKeys(kv: Deno.Kv): Promise<string[]> {
  const keys: string[] = [];
  for await (const entry of kv.list({ prefix: ["kv"] })) pushValidKey(keys, entry);
  return keys;
}

async function listKvEntries(): Promise<string[]> {
  const kv = await getKv();
  return collectKeys(kv);
}

export async function listKeys(prefix?: string): Promise<string[]> {
  const keys = await listKvEntries();
  return prefix === undefined ? keys : keys.filter((k) => k.startsWith(prefix));
}

export async function deleteKey(logicalKey: string): Promise<void> {
  const kv = await getKv();
  await kv.delete(["kv", logicalKey]);
}
