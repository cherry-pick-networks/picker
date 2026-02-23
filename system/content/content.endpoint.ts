import type { Context } from "hono";
import {
  createItem,
  CreateItemRequestSchema,
  getItem as svcGetItem,
  ItemPatchSchema,
  updateItem,
} from "./content.service.ts";
import type { ItemPatch } from "./content.schema.ts";
export {
  getSubmission,
  getSubmissions,
  postSubmission,
} from "./content-submission.endpoint.ts";
export {
  getWorksheet,
  postWorksheetsBuildPrompt,
  postWorksheetsGenerate,
} from "./content-worksheet.endpoint.ts";
export { postBriefingBuildPrompt } from "./content-briefing.endpoint.ts";

export async function getItem(c: Context) {
  const id = c.req.param("id");
  const item = await svcGetItem(id);
  if (item == null) return c.json({ error: "Not found" }, 404);
  return c.json(item);
}

async function doPostItem(
  c: Context,
  data: Parameters<typeof createItem>[0],
) {
  const res = await createItem(data);
  return res.ok ? c.json(res.data, 201) : c.json({ error: res.error }, 400);
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
  const result = await updateItem(id, data);
  if (result == null) return c.json({ error: "Not found" }, 404);
  if (!result.ok) return c.json({ error: result.error }, 400);
  return c.json(result.data);
}

export async function patchItem(c: Context) {
  const id = c.req.param("id");
  const r = await parsePatchBody(c);
  if ("err" in r) return r.err;
  return patchItemResponse(c, id, r.data);
}
