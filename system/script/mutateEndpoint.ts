/**
 * POST /script/mutate: body validated with mutateSchema, then mutateService.
 */

import type { Context } from 'hono';
import { mutateScript } from '#system/script/mutateService.ts';
import type { MutateResponse } from '#system/script/mutateSchema.ts';
import { MutateRequestSchema } from '#system/script/mutateSchema.ts';

async function parseMutateBody(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  return MutateRequestSchema.safeParse(body);
}

function toResponse(c: Context, result: MutateResponse): Response {
  const status: 200 | 400 | 403 | 404 | 500 = result.ok
    ? 200
    : (result.status as 400 | 403 | 404 | 500);
  return c.json(result, status);
}

export async function postScriptMutate(c: Context): Promise<Response> {
  const parsed = await parseMutateBody(c);
  if (!parsed.success) {
    const err = {
      ok: false as const,
      status: 400,
      body: parsed.error.flatten(),
    };
    return c.json(err, 400);
  }
  const result = await mutateScript(parsed.data);
  return toResponse(c, result);
}
