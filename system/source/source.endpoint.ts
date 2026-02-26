import type { Context } from "hono";
import { isAgentRequest } from "#system/app/request-context.ts";
import {
  extractConceptsFromSource,
} from "#system/source/source-extract.service.ts";
import {
  createSource,
  CreateSourceRequestSchema,
  getSource as svcGetSource,
  listSources,
} from "./source.service.ts";
import { redactSource } from "#system/record/sensitive-redact.ts";

export async function getSources(c: Context) {
  const sources = await listSources();
  if (isAgentRequest(c)) return c.json({ sources });
  const redacted = sources.map(redactSource);
  return c.json({ sources: redacted });
}

export async function getSource(c: Context) {
  const id = c.req.param("id");
  const source = await svcGetSource(id);
  if (source == null) return c.json({ error: "Not found" }, 404);
  return c.json(isAgentRequest(c) ? source : redactSource(source));
}

// function-length-ignore
async function doPostSource(
  c: Context,
  data: Parameters<typeof createSource>[0],
) {
  try {
    return c.json(await createSource(data), 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid source";
    return c.json({ error: msg }, 400);
  }
}

export async function postSource(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = CreateSourceRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  return doPostSource(c, parsed.data);
}

export async function postSourceExtract(c: Context) {
  const id = c.req.param("id");
  const result = await extractConceptsFromSource(id);
  if (!result.ok) {
    const status = result.status;
    return c.json(
      { ok: false, status, body: result.message },
      status,
    );
  }
  return c.json({
    ok: true,
    concept_ids: result.concept_ids,
    ...(result.subject_id != null && { subject_id: result.subject_id }),
    extracted_at: result.extracted_at,
  });
}
