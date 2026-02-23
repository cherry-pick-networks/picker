import { z } from "zod";
import type { Context } from "hono";
import {
  listKeys,
  getKey,
  setKey,
  deleteKey,
} from "./kv.store.ts";

const KvBodySchema = z.object({ key: z.string(), value: z.unknown() });

export async function getKvList(c: Context) {
  const prefix = c.req.query("prefix") ?? undefined;
  const keys = await listKeys(prefix);
  return c.json({ keys });
}

export async function postKv(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = KvBodySchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  await setKey(parsed.data.key, parsed.data.value);
  return c.json({ key: parsed.data.key });
}

export async function getKvKey(c: Context) {
  const key = c.req.param("key");
  const value = await getKey(key);
  return c.json(value ?? null);
}

export async function deleteKvKey(c: Context) {
  const key = c.req.param("key");
  await deleteKey(key);
  return c.body(null, 204);
}
