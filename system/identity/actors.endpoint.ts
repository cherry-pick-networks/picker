/**
 * Identity actors HTTP: list, get, create, patch.
 */

import type { Context } from "hono";
import { ActorCreateSchema, ActorPatchSchema } from "./actors.schema.ts";
import {
  createActor,
  getActor,
  listActors,
  updateActor,
} from "./actors.service.ts";

export async function getActorsList(c: Context) {
  const name = c.req.query("name") ?? c.req.query("display_name");
  const list = await listActors(name ?? undefined);
  return c.json(list);
}

export async function getActorById(c: Context) {
  const id = c.req.param("id");
  const actor = await getActor(id);
  if (actor == null) return c.json({ error: "Not found" }, 404);
  return c.json(actor);
}

export async function postActor(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = ActorCreateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  try {
    const actor = await createActor(parsed.data);
    return c.json(actor, 201);
  } catch {
    return c.json({ error: "Invalid actor" }, 400);
  }
}

export async function patchActorById(c: Context) {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const parsed = ActorPatchSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  const actor = await updateActor(id, parsed.data);
  if (actor == null) return c.json({ error: "Not found" }, 404);
  return c.json(actor);
}
