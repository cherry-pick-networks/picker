import type { Context } from "hono";
import {
  buildWorksheetPrompt,
  generateWorksheet,
  GenerateWorksheetRequestSchema,
  getWorksheet as svcGetWorksheet,
} from "./content.service.ts";

export async function getWorksheet(c: Context) {
  const id = c.req.param("id");
  const worksheet = await svcGetWorksheet(id);
  if (worksheet == null) return c.json({ error: "Not found" }, 404);
  return c.json(worksheet);
}

async function doPostWorksheetsGenerate(
  c: Context,
  data: Parameters<typeof generateWorksheet>[0],
) {
  const res = await generateWorksheet(data);
  return res.ok ? c.json(res.data, 201) : c.json({ error: res.error }, 400);
}

export async function postWorksheetsGenerate(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = GenerateWorksheetRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  return doPostWorksheetsGenerate(c, parsed.data);
}

async function doPostWorksheetsBuildPrompt(
  c: Context,
  data: Parameters<typeof buildWorksheetPrompt>[0],
) {
  const res = await buildWorksheetPrompt(data);
  const code = res.ok ? 200 : (res.status === 500 ? 500 : 400);
  return res.ok ? c.json(res.data, 200) : c.json({ error: res.error }, code);
}

export async function postWorksheetsBuildPrompt(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = GenerateWorksheetRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  return doPostWorksheetsBuildPrompt(c, parsed.data);
}
