import { z } from "zod";
import type { Context } from "hono";
import { getKv, listKeys } from "../store/kv.ts";

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
  return setKvAndRespond(c, parsed.data);
}

async function setKvAndRespond(
  c: Context,
  data: { key: string; value: unknown },
): Promise<Response> {
  const kv = await getKv();
  await kv.set(["kv", data.key], data.value);
  return c.json({ key: data.key });
}

export async function getKvKey(c: Context) {
  const key = c.req.param("key");
  const kv = await getKv();
  const e = await kv.get(["kv", key]);
  return c.json(e.value ?? null);
}

export async function deleteKvKey(c: Context) {
  const key = c.req.param("key");
  const kv = await getKv();
  await kv.delete(["kv", key]);
  return c.body(null, 204);
}
