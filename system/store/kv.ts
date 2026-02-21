let kvPromise: Promise<Deno.Kv> | null = null;

export function getKv(): Promise<Deno.Kv> {
  if (!kvPromise) kvPromise = Deno.openKv();
  return kvPromise;
}

/**
 * List logical keys in KV under the "kv" prefix. Optional prefix filters keys
 * that start with that string. Returns only the key part (e.g. "foo"), not the
 * full path (["kv", "foo"]).
 */
export async function listKeys(prefix?: string): Promise<string[]> {
  const kv = await getKv();
  // Deno KV prefix matches full key parts only, so we always list under "kv"
  // and filter by logicalKey.startsWith(prefix) when prefix is provided.
  const keys: string[] = [];
  for await (const entry of kv.list({ prefix: ["kv"] })) {
    const keyParts = entry.key as string[];
    if (keyParts.length >= 2 && keyParts[0] === "kv") {
      const logicalKey = keyParts.slice(1).join("/");
      if (prefix === undefined || logicalKey.startsWith(prefix)) {
        keys.push(logicalKey);
      }
    }
  }
  return keys;
}

/**
 * Delete one logical key from KV under the "kv" prefix.
 */
export async function deleteKey(logicalKey: string): Promise<void> {
  const kv = await getKv();
  await kv.delete(["kv", logicalKey]);
}
