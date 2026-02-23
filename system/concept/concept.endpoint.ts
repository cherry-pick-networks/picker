import type { Context } from "hono";
import {
  getConcept as svcGetConcept,
  getDependencies as svcGetDependencies,
  getScheme as svcGetScheme,
  getTree as svcGetTree,
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
  return c.json({ concepts: await listConceptsByScheme(schemeId) });
}

export async function getConcept(c: Context) {
  const id = c.req.param("id");
  const concept = await svcGetConcept(id);
  if (concept == null) return c.json({ error: "Not found" }, 404);
  return c.json(concept);
}

export async function getSchemeTree(c: Context) {
  const schemeId = c.req.param("id");
  if (!schemeId?.trim()) return c.json({ error: "Invalid scheme id" }, 400);
  const tree = await svcGetTree(schemeId);
  return tree == null ? c.json({ error: "Not found" }, 404) : c.json(tree);
}

export async function getConceptDependencies(c: Context) {
  const id = c.req.param("id");
  if (!id?.trim()) return c.json({ error: "Invalid concept id" }, 400);
  const result = await svcGetDependencies(id);
  return result == null ? c.json({ error: "Not found" }, 404) : c.json(result);
}
