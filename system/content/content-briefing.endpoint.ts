import type { Context } from "hono";
import {
  buildBriefingPrompt,
  BuildBriefingRequestSchema,
} from "./content.service.ts";

// function-length-ignore
export async function postBriefingBuildPrompt(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = BuildBriefingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  const result = await buildBriefingPrompt(parsed.data);
  if (result == null) return c.json({ error: "Not found" }, 404);
  return c.json(result);
}
