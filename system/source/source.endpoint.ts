import type { Context } from "hono";
import {
  createSource,
  CreateSourceRequestSchema,
  getSource as svcGetSource,
  listSources,
} from "./source.service.ts";

export async function getSources(c: Context) {
  const sources = await listSources();
  return c.json({ sources });
}

export async function getSource(c: Context) {
  const id = c.req.param("id");
  const source = await svcGetSource(id);
  if (source == null) return c.json({ error: "Not found" }, 404);
  return c.json(source);
}

async function doPostSource(
  c: Context,
  data: Parameters<typeof createSource>[0],
) {
  const res = await createSource(data);
  return res.ok ? c.json(res.data, 201) : c.json({ error: res.error }, 400);
}

export async function postSource(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = CreateSourceRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  return doPostSource(c, parsed.data);
}
