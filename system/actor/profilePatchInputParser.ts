import type { Context } from 'hono';
import type { PatchProfileInput, PatchProgressInput } from './profileTypes.ts';
import { ProfilePatchSchema, ProgressPatchSchema } from './profileService.ts';

export async function getPatchProfileInput(
  c: Context,
): Promise<PatchProfileInput | Response> {
  const [id, body] = [c.req.param('id'), await c.req.json().catch(() => ({}))];
  const parsed = ProfilePatchSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  return { id, parsed };
}

export async function getPatchProgressInput(
  c: Context,
): Promise<PatchProgressInput | Response> {
  const [id, body] = [c.req.param('id'), await c.req.json().catch(() => ({}))];
  const parsed = ProgressPatchSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  return { id, parsed };
}
