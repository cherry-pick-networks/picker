import type { Context } from "hono";
import {
  getItem as svcGetItem,
  createItem,
  updateItem,
  getWorksheet as svcGetWorksheet,
  generateWorksheet,
  buildWorksheetPrompt,
  CreateItemRequestSchema,
  GenerateWorksheetRequestSchema,
  ItemPatchSchema,
} from "../service/content.ts";

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

export async function patchItem(c: Context) {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const parsed = ItemPatchSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  const item = await updateItem(id, parsed.data);
  if (item == null) return c.json({ error: "Not found" }, 404);
  return c.json(item);
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
