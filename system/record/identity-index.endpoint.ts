import type { Context } from "hono";
import { isAgentRequest } from "#system/app/request-context.ts";
import {
  getIdentityById as getIdentityByIdStore,
  readIdentityIndex,
} from "./identity-index.store.ts";
import {
  redactIdentityEntry,
  redactIdentityIndex,
} from "./sensitive-redact.ts";

export async function getIdentityIndex(c: Context) {
  const index = await readIdentityIndex();
  if (isAgentRequest(c)) return c.json(index);
  return c.json(redactIdentityIndex(index));
}

export async function getIdentityById(c: Context) {
  const id = c.req.param("id");
  const student = await getIdentityByIdStore(id);
  if (student == null) return c.json({ error: "Not found" }, 404);
  return c.json(isAgentRequest(c) ? student : redactIdentityEntry(student));
}
