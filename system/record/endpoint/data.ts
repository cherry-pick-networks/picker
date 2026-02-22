import type { Context } from "hono";
import {
  readExtractedFile,
  readExtractedIndex,
  readIdentityFile,
  readIdentityIndex,
} from "../store/data.ts";

export async function getExtractedIndex(c: Context) {
  const index = await readExtractedIndex();
  return c.json(index);
}

export async function getIdentityIndex(c: Context) {
  const index = await readIdentityIndex();
  return c.json(index);
}

export async function getExtractedById(c: Context) {
  const id = c.req.param("id");
  const body = await readExtractedFile(id);
  if (body == null) return c.json({ error: "Not found" }, 404);
  return c.json(body);
}

export async function getIdentityById(c: Context) {
  const id = c.req.param("id");
  const body = await readIdentityFile(id);
  if (body == null) return c.json({ error: "Not found" }, 404);
  return c.json(body);
}
