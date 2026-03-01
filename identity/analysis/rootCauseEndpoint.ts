//  HTTP handler for root-cause inference API.

import type { Context } from 'hono';
import { RootCauseRequestSchema } from './rootCauseSchema.ts';
import { inferRootCause } from './rootCauseService.ts';

export async function postRootCause(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = RootCauseRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  return inferRootCause(parsed.data).then((result) =>
    c.json(result)
  );
}
