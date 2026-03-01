import type { Context } from 'hono';
import {
  generateDynamicItems,
  GenerateDynamicRequestSchema,
} from './generateDynamicService.ts';
import {
  createItem,
  CreateItemRequestSchema,
  getItem as svcGetItem,
  ItemPatchSchema,
  updateItem,
} from './service.ts';
import type { ItemPatch } from './schema.ts';

export async function getItem(c: Context) {
  const id = c.req.param('id');
  const item = await svcGetItem(id);
  if (item == null) {
    return c.json({ error: 'Not found' }, 404);
  }
  return c.json(item);
}

async function doPostItem(
  c: Context,
  data: Parameters<typeof createItem>[0],
) {
  try {
    return c.json(await createItem(data), 201);
  } catch {
    return c.json({ error: 'Invalid item' }, 400);
  }
}

export async function postItem(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = CreateItemRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  return doPostItem(c, parsed.data);
}

async function parsePatchBody(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = ItemPatchSchema.safeParse(body);
  return parsed.success ? { data: parsed.data } : {
    err: c.json({ error: parsed.error.flatten() }, 400),
  };
}

async function patchItemResponse(
  c: Context,
  id: string,
  data: ItemPatch,
) {
  const item = await updateItem(id, data);
  if (item == null) {
    return c.json({ error: 'Not found' }, 404);
  }
  return c.json(item);
}

export async function patchItem(c: Context) {
  const id = c.req.param('id');
  const r = await parsePatchBody(c);
  if ('err' in r) return r.err;
  return patchItemResponse(c, id, r.data);
}

// function-length-ignore — parse body + generate + response.
export async function postGenerateDynamic(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = GenerateDynamicRequestSchema.safeParse(
    body,
  );
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  const result = await generateDynamicItems(parsed.data);
  if (!result.ok) {
    return c.json({ error: result.error }, 400);
  }
  return c.json({ items: result.items });
}
