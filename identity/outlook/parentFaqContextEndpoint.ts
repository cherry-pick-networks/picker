import type { Context } from 'hono';
import {
  getParentFaqContext as buildParentFaqContext,
} from './parentFaqContextService.ts';

export async function getParentFaqContext(c: Context) {
  const actorId = c.req.query('actor_id');
  if (!actorId) {
    return c.json({ error: 'actor_id required' }, 400);
  }
  const result = await buildParentFaqContext({
    actor_id: actorId,
    topic: c.req.query('topic') ?? undefined,
  });
  return c.json(result);
}
