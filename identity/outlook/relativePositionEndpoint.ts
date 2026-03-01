import type { Context } from 'hono';
import {
  getRelativePosition as buildRelativePosition,
} from './relativePositionService.ts';

function relativePositionQuery(c: Context) {
  const actorId = c.req.query('actor_id');
  const schemeId = c.req.query('scheme_id');
  if (!actorId || !schemeId) return null;
  return {
    actor_id: actorId,
    scheme_id: schemeId,
    from: c.req.query('from') ?? undefined,
    to: c.req.query('to') ?? undefined,
  };
}

export function getRelativePosition(c: Context) {
  const q = relativePositionQuery(c);
  if (!q) {
    return Promise.resolve(c.json({
      error: 'actor_id and scheme_id required',
    }, 400));
  }
  return Promise.resolve(c.json(buildRelativePosition(q)));
}
