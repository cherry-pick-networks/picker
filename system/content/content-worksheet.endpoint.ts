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

// function-length-ignore
async function doPostWorksheetsGenerate(
  c: Context,
  data: Parameters<typeof generateWorksheet>[0],
) {
  try {
    return c.json(await generateWorksheet(data), 201);
  } catch {
    return c.json({ error: "Generate failed" }, 400);
  }
}

export async function postWorksheetsGenerate(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = GenerateWorksheetRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  return doPostWorksheetsGenerate(c, parsed.data);
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
