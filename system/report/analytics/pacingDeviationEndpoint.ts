import type { Context } from 'hono';
import { buildPacingDeviation } from '#system/report/analytics/pacingDeviationService.ts';

export function getPacingDeviation(c: Context) {
  const actorId = c.req.query('actor_id');
  const schemeId = c.req.query('scheme_id');
  if (!actorId || !schemeId) {
    return c.json({
      error: 'actor_id and scheme_id required',
    }, 400);
  }
  return buildPacingDeviation({
    actor_id: actorId,
    scheme_id: schemeId,
    from: c.req.query('from') ?? undefined,
    to: c.req.query('to') ?? undefined,
  }).then((r) => c.json(r));
}
