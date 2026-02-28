import type { Context } from "hono";
import {
  buildWorksheetPrompt,
  createItem,
  CreateItemRequestSchema,
  createWorksheet,
  CreateWorksheetRequestSchema,
  GenerateWorksheetRequestSchema,
  getItem as svcGetItem,
  getWorksheet as svcGetWorksheet,
  ItemPatchSchema,
  updateItem,
} from "./content.service.ts";
import type { ItemPatch } from "./content.schema.ts";

export async function getItem(c: Context) {
  const id = c.req.param("id");
  const item = await svcGetItem(id);
  if (item == null) return c.json({ error: "Not found" }, 404);
  return c.json(item);
}

// function-length-ignore
async function doPostItem(
  c: Context,
  data: Parameters<typeof createItem>[0],
) {
  try {
    return c.json(await createItem(data), 201);
  } catch {
    return c.json({ error: "Invalid item" }, 400);
  }
}

export async function postItem(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = CreateItemRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  return doPostItem(c, parsed.data);
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

export async function postWorksheets(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = CreateWorksheetRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  try {
    return c.json(await createWorksheet(parsed.data), 201);
  } catch {
    return c.json({ error: "Create worksheet failed" }, 400);
  }
}

// function-length-ignore
async function doPostWorksheetsBuildPrompt(
  c: Context,
  data: Parameters<typeof buildWorksheetPrompt>[0],
) {
  try {
    return c.json(await buildWorksheetPrompt(data));
  } catch {
    return c.json({ error: "Build prompt failed" }, 500);
  }
}

export async function postWorksheetsBuildPrompt(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = GenerateWorksheetRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  return doPostWorksheetsBuildPrompt(c, parsed.data);
}
