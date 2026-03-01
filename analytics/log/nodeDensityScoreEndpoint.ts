import type { Context } from 'hono';
import { buildNodeDensityScore } from '#analytics/log/nodeDensityScoreService.ts';

export async function getNodeDensityScore(c: Context) {
  const schemeId = c.req.query('scheme_id');
  if (!schemeId) {
    return c.json({ error: 'scheme_id required' }, 400);
  }
  const result = await buildNodeDensityScore({
    actor_id: c.req.query('actor_id') ?? undefined,
    scheme_id: schemeId,
    from: c.req.query('from') ?? undefined,
    to: c.req.query('to') ?? undefined,
  });
  return c.json(result);
}
