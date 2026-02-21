import type { Context } from "hono";
import { z } from "zod";
import {
  getProfile as svcGetProfile,
  createProfile,
  updateProfile,
  getProgress as svcGetProgress,
  updateProgress,
  ProfileCreateSchema,
  ProfilePatchSchema,
  ProgressPatchSchema,
} from "../service/profile.ts";

export async function getProfile(c: Context) {
  const id = c.req.param("id");
  const profile = await svcGetProfile(id);
  if (profile == null) return c.json({ error: "Not found" }, 404);
  return c.json(profile);
}

export async function postProfile(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = ProfileCreateSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  try {
    const profile = await createProfile(parsed.data);
    return c.json(profile, 201);
  } catch {
    return c.json({ error: "Invalid profile" }, 400);
  }
}

async function patchProfileApply(
  c: Context,
  id: string,
  data: z.infer<typeof ProfilePatchSchema>,
): Promise<Response> {
  const profile = await updateProfile(id, data);
  if (profile == null) return c.json({ error: "Not found" }, 404);
  return c.json(profile);
}

export async function patchProfile(c: Context) {
  const id = c.req.param("id");
  const parsed = ProfilePatchSchema.safeParse(
    await c.req.json().catch(() => ({})),
  );
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  return patchProfileApply(c, id, parsed.data).catch(() =>
    c.json({ error: "Invalid profile" }, 400),
  );
}

export async function getProgress(c: Context) {
  const id = c.req.param("id");
  const progress = await svcGetProgress(id);
  if (progress == null) return c.json({ error: "Not found" }, 404);
  return c.json(progress);
}

async function patchProgressApply(
  c: Context,
  id: string,
  data: z.infer<typeof ProgressPatchSchema>,
): Promise<Response> {
  const progress = await updateProgress(id, data);
  return c.json(progress);
}

export async function patchProgress(c: Context) {
  const id = c.req.param("id");
  const parsed = ProgressPatchSchema.safeParse(
    await c.req.json().catch(() => ({})),
  );
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  return patchProgressApply(c, id, parsed.data).catch(() =>
    c.json({ error: "Invalid progress" }, 400),
  );
}
