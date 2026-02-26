import type { Context } from "hono";
import {
  getIdentityById as getIdentityByIdStore,
  readIdentityIndex,
} from "./data.store.ts";

export async function getIdentityIndex(c: Context) {
  const index = await readIdentityIndex();
  return c.json(index);
}

export async function getIdentityById(c: Context) {
  const id = c.req.param("id");
  const student = await getIdentityByIdStore(id);
  if (student == null) return c.json({ error: "Not found" }, 404);
  return c.json(student);
}
