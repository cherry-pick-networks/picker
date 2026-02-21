import type { Context } from "hono";
import {
  getSource as svcGetSource,
  createSource,
  listSources,
  CreateSourceRequestSchema,
} from "../service/source.ts";

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

export async function postSource(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = CreateSourceRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  try {
    const source = await createSource(parsed.data);
    return c.json(source, 201);
  } catch {
    return c.json({ error: "Invalid source" }, 400);
  }
}
