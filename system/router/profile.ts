import type { Context } from "hono";
import { z } from "zod";
import {
  createProfile,
  getProfile as svcGetProfile,
  getProgress as svcGetProgress,
  ProfileCreateSchema,
  ProfilePatchSchema,
  ProgressPatchSchema,
  updateProfile,
  updateProgress,
} from "../service/profile.ts";

export async function getProfile(c: Context) {
  const id = c.req.param("id");
  const profile = await svcGetProfile(id);
  if (profile == null) return c.json({ error: "Not found" }, 404);
  return c.json(profile);
}

// function-length-ignore
async function doPostProfile(c: Context, data: Parameters<typeof createProfile>[0]) {
  try { return c.json(await createProfile(data), 201); }
  catch { return c.json({ error: "Invalid profile" }, 400); }
}

export async function postProfile(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = ProfileCreateSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  return doPostProfile(c, parsed.data);
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

// function-length-ignore
async function doPatchProfile(
  c: Context,
  id: string,
  data: z.infer<typeof ProfilePatchSchema>,
) {
  return await patchProfileApply(c, id, data).catch(() =>
    c.json({ error: "Invalid profile" }, 400));
}

async function getPatchProfileInput(c: Context): Promise<
  { id: string; parsed: z.SafeParseReturnType<unknown, z.infer<typeof ProfilePatchSchema>> }
  | Response
> {
  const [id, body] = [c.req.param("id"), await c.req.json().catch(() => ({}))];
  const parsed = ProfilePatchSchema.safeParse(body);
  return !parsed.success ? c.json({ error: parsed.error.flatten() }, 400) : { id, parsed };
}

export async function patchProfile(c: Context) {
  const input = await getPatchProfileInput(c);
  if (input instanceof Response) return input;
  return doPatchProfile(c, input.id, input.parsed.data);
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

// function-length-ignore
async function doPatchProgress(
  c: Context,
  id: string,
  data: z.infer<typeof ProgressPatchSchema>,
) {
  return await patchProgressApply(c, id, data).catch(() =>
    c.json({ error: "Invalid progress" }, 400));
}

async function getPatchProgressInput(c: Context): Promise<
  { id: string; parsed: z.SafeParseReturnType<unknown, z.infer<typeof ProgressPatchSchema>> }
  | Response
> {
  const [id, body] = [c.req.param("id"), await c.req.json().catch(() => ({}))];
  const parsed = ProgressPatchSchema.safeParse(body);
  return !parsed.success ? c.json({ error: parsed.error.flatten() }, 400) : { id, parsed };
}

export async function patchProgress(c: Context) {
  const input = await getPatchProgressInput(c);
  if (input instanceof Response) return input;
  return doPatchProgress(c, input.id, input.parsed.data);
}
