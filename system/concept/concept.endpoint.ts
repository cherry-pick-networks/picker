import type { Context } from "hono";
import {
  getConcept as svcGetConcept,
  getScheme as svcGetScheme,
  listConceptsByScheme,
  listSchemes,
} from "./concept.service.ts";

export async function getSchemes(c: Context) {
  const schemes = await listSchemes();
  return c.json({ schemes });
}

export async function getScheme(c: Context) {
  const schemeId = c.req.param("schemeId");
  const scheme = await svcGetScheme(schemeId);
  if (scheme == null) return c.json({ error: "Not found" }, 404);
  return c.json(scheme);
}

export async function getSchemeConcepts(c: Context) {
  const schemeId = c.req.param("schemeId");
  const scheme = await svcGetScheme(schemeId);
  if (scheme == null) return c.json({ error: "Not found" }, 404);
  const concepts = await listConceptsByScheme(schemeId);
  return c.json({ concepts });
}

export async function getConcept(c: Context) {
  const id = c.req.param("id");
  const concept = await svcGetConcept(id);
  if (concept == null) return c.json({ error: "Not found" }, 404);
  return c.json(concept);
}
