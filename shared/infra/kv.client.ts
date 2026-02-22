/**
 * Shared Deno KV client. Single instance for all domains. Domain stores
 * and system/kv use this; do not open Kv elsewhere.
 */

let kvPromise: Promise<Deno.Kv> | null = null;

export function getKv(): Promise<Deno.Kv> {
  if (!kvPromise) kvPromise = Deno.openKv();
  return kvPromise;
}
