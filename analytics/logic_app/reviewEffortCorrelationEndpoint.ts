import type { Context } from 'hono';
import {
  getReviewEffortCorrelation
    as buildReviewEffortCorrelation,
} from '#analytics/logic_app/reviewEffortCorrelationService.ts';

export async function getReviewEffortCorrelation(
  c: Context,
) {
  const actorId = c.req.query('actor_id');
  if (!actorId) {
    return c.json({ error: 'actor_id required' }, 400);
  }
  const result = await buildReviewEffortCorrelation({
    actor_id: actorId,
    from: c.req.query('from') ?? undefined,
    to: c.req.query('to') ?? undefined,
  });
  return c.json(result);
}
