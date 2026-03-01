import { z } from 'zod';
import type { Context } from 'hono';
import {
  deleteKey,
  getKey,
  listKeys,
  setKey,
} from './storageStore.ts';

const KvBodySchema = z.object({
  key: z.string(),
  value: z.unknown(),
});

export async function getKvList(c: Context) {
  const prefix = c.req.query('prefix') ?? undefined;
  const keys = await listKeys(prefix);
  return c.json({ keys });
}

export async function postKv(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = KvBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  return setKvAndRespond(c, parsed.data);
}

async function persistKv(
  data: { key: string; value: unknown },
): Promise<void> {
  await setKey(data.key, data.value);
  return;
}

function respondKvCreated(
  c: Context,
  key: string,
): Response {
  return c.json({ key });
}

async function setKvAndRespond(
  c: Context,
  data: { key: string; value: unknown },
): Promise<Response> {
  await persistKv(data);
  return respondKvCreated(c, data.key);
}

export async function getKvKey(c: Context) {
  const key = c.req.param('key');
  const value = await getKey(key);
  return c.json(value ?? null);
}

export async function deleteKvKey(c: Context) {
  const key = c.req.param('key');
  await deleteKey(key);
  return c.body(null, 204);
}
