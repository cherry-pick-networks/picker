import type { Context } from 'hono';
import {
  getInterventionResult as buildInterventionResult,
} from './interventionResultService.ts';

export async function getInterventionResult(c: Context) {
  const actorId = c.req.query('actor_id');
  if (!actorId) {
    return c.json({ error: 'actor_id required' }, 400);
  }
  const result = await buildInterventionResult({
    actor_id: actorId,
    from: c.req.query('from') ?? undefined,
    to: c.req.query('to') ?? undefined,
  });
  return c.json(result);
}
