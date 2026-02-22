import type { Context } from "hono";
import {
  buildWorksheetPrompt,
  createItem,
  CreateItemRequestSchema,
  generateWorksheet,
  GenerateWorksheetRequestSchema,
  getItem as svcGetItem,
  getWorksheet as svcGetWorksheet,
  ItemPatchSchema,
  updateItem,
} from "../service/content.ts";
import type { ItemPatch } from "../service/content-schema.ts";

export async function getItem(c: Context) {
  const id = c.req.param("id");
  const item = await svcGetItem(id);
  if (item == null) return c.json({ error: "Not found" }, 404);
  return c.json(item);
}

export async function postItem(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = CreateItemRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  try {
    const item = await createItem(parsed.data);
    return c.json(item, 201);
  } catch {
    return c.json({ error: "Invalid item" }, 400);
  }
}

async function parsePatchBody(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = ItemPatchSchema.safeParse(body);
  return parsed.success
    ? { data: parsed.data }
    : { err: c.json({ error: parsed.error.flatten() }, 400) };
}

async function patchItemResponse(
  c: Context,
  id: string,
  data: ItemPatch,
) {
  const item = await updateItem(id, data);
  if (item == null) return c.json({ error: "Not found" }, 404);
  return c.json(item);
}

export async function patchItem(c: Context) {
  const id = c.req.param("id");
  const r = await parsePatchBody(c);
  if ("err" in r) return r.err;
  return patchItemResponse(c, id, r.data);
}

export async function getWorksheet(c: Context) {
  const id = c.req.param("id");
  const worksheet = await svcGetWorksheet(id);
  if (worksheet == null) return c.json({ error: "Not found" }, 404);
  return c.json(worksheet);
}

export async function postWorksheetsGenerate(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = GenerateWorksheetRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  try {
    const worksheet = await generateWorksheet(parsed.data);
    return c.json(worksheet, 201);
  } catch {
    return c.json({ error: "Generate failed" }, 400);
  }
}

export async function postWorksheetsBuildPrompt(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = GenerateWorksheetRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  try {
    const result = await buildWorksheetPrompt(parsed.data);
    return c.json(result);
  } catch {
    return c.json({ error: "Build prompt failed" }, 500);
  }
}
